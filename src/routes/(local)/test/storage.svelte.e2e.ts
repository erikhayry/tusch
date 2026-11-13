import { m } from '$lib/paraglide/messages';
import { expect, test, type Page } from '@playwright/test';
import { EXAMPLES } from '../../../examples/examples';
import { gotoHydrated } from '../../../tests/e2e/gotoHydrated';
import { activate } from '../../../tests/e2e/keyboard';
import { panelImageSrc as storedPanelImageSrc, storedFiles } from '../../../tests/e2e/storage';

const EXAMPLE = EXAMPLES[0];
const PANEL = EXAMPLE.panels[0];
const PANEL_URL = `/comic/${EXAMPLE.id}/${PANEL.id}`;

function panelImageSrc(page: Page): Promise<string | undefined> {
	return storedPanelImageSrc(page, EXAMPLE.id, PANEL.id);
}

async function generatePanelImage(page: Page) {
	await activate(page, page.getByRole('button', { name: m.removeImage() }));
	await activate(page, page.getByRole('button', { name: m.addImage() }));
}

test.describe('image files', { tag: '@REQ-025' }, () => {
	test('replacing a panel image keeps the old file until it is replaced again', async ({
		page,
	}) => {
		await gotoHydrated(page, PANEL_URL);
		await generatePanelImage(page);
		await expect(page.getByRole('img', { name: 'mock alt text' })).toBeVisible();
		const first = await panelImageSrc(page);
		expect(await storedFiles(page)).toContain(first);

		await activate(page, page.getByRole('button', { name: m.generateNewImage() }));
		await expect.poll(() => panelImageSrc(page)).not.toBe(first);
		const second = await panelImageSrc(page);

		// The previous image is kept so it can be restored.
		expect(await storedFiles(page)).toContain(first);

		await activate(page, page.getByRole('button', { name: m.generateNewImage() }));
		await expect.poll(() => panelImageSrc(page)).not.toBe(second);

		const files = await storedFiles(page);
		expect(files).not.toContain(first);
		expect(files).toContain(second);
		expect(files).toContain(await panelImageSrc(page));
	});

	test('deleting a cover removes its file', async ({ page }) => {
		await gotoHydrated(page, `/comic/${EXAMPLE.id}`);
		await activate(page, page.getByRole('button', { name: m.deleteCover() }));
		await activate(page, page.getByRole('button', { name: m.addCover() }));
		await expect.poll(async () => (await storedFiles(page)).length).toBe(1);

		await activate(page, page.getByRole('button', { name: m.deleteCover() }));

		await expect.poll(() => storedFiles(page)).toEqual([]);
	});

	test('a generation that fails part-way leaves no metadata or files', async ({ page }) => {
		// Fail the second OPFS write (the first character crop, after the main image).
		await page.addInitScript(() => {
			let writes = 0;
			const original = FileSystemFileHandle.prototype.createWritable;
			FileSystemFileHandle.prototype.createWritable = function (...args) {
				writes += 1;
				if (writes === 2) return Promise.reject(new Error('Simulated disk failure'));
				return original.apply(this, args);
			};
		});
		await gotoHydrated(page, PANEL_URL);
		await activate(page, page.getByRole('button', { name: m.removeImage() }));
		await expect(page.getByRole('button', { name: m.addImage() })).toBeVisible();

		await activate(page, page.getByRole('button', { name: m.addImage() }));

		await expect(page.getByTestId('error-test-id')).toContainText('Simulated disk failure');
		expect(await panelImageSrc(page)).toBeUndefined();
		await expect.poll(() => storedFiles(page)).toEqual([]);
	});
});

test(
	'recovers from corrupt stored comics and keeps a copy',
	{ tag: '@REQ-026' },
	async ({ page }) => {
		await page.addInitScript(() => {
			if (sessionStorage.getItem('seeded-corrupt')) return;
			sessionStorage.setItem('seeded-corrupt', '1');
			localStorage.setItem('comics_db', '{not json');
		});

		await gotoHydrated(page, '/');

		await expect(page.getByRole('link', { name: EXAMPLE.title })).toBeVisible();
		expect(await page.evaluate(() => localStorage.getItem('comics_db_invalid'))).toBe('{not json');
	},
);

test.describe('missing images', { tag: '@REQ-036' }, () => {
	test('example comics show their bundled images', async ({ page }) => {
		await gotoHydrated(page, PANEL_URL);
		await expect(page.locator(`img[src="${PANEL.image!.landscape.src}"]`).first()).toBeVisible();
	});

	test('a stored image whose file is gone shows the placeholder', async ({ page }) => {
		await gotoHydrated(page, PANEL_URL);
		await generatePanelImage(page);
		await expect(page.getByRole('img', { name: 'mock alt text' })).toBeVisible();

		const src = await panelImageSrc(page);
		await page.evaluate(async (name) => {
			const root = await navigator.storage.getDirectory();
			await root.removeEntry(name!);
		}, src);
		await page.reload();

		await expect(page.getByRole('img', { name: 'mock alt text' })).toHaveAttribute(
			'src',
			'/missing-image.svg',
		);
	});
});
