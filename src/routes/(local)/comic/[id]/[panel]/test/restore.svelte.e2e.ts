import { m } from '$lib/paraglide/messages';
import { expect, test, type Locator, type Page } from '@playwright/test';
import { EXAMPLES } from '../../../../../../examples/examples';
import { gotoHydrated } from '../../../../../../tests/e2e/gotoHydrated';
import { activate } from '../../../../../../tests/e2e/keyboard';
import {
	panelImageSrc as storedPanelImageSrc,
	storedFiles,
} from '../../../../../../tests/e2e/storage';
import { PanelPage } from './utils/panelPage';

const EXAMPLE = EXAMPLES[0];
const PANEL = EXAMPLE.panels[0];

function panelImageSrc(page: Page): Promise<string | undefined> {
	return storedPanelImageSrc(page, EXAMPLE.id, PANEL.id);
}

/** Wait until none of the given files remain in OPFS. */
async function expectFilesGone(page: Page, names: string[]) {
	await expect
		.poll(async () => {
			const files = await storedFiles(page);
			return names.some((name) => files.includes(name));
		})
		.toBe(false);
}

type StoredCrop = { id: string; head: string; full: string };

/** Character crops stored for the example panel, across all characters. */
function panelCrops(page: Page): Promise<StoredCrop[]> {
	return page.evaluate(
		({ comicId, panelId }) => {
			const { comics } = JSON.parse(localStorage.getItem('comics_db') ?? '{"comics":[]}');
			const comic = comics.find((c: { id: string }) => c.id === comicId);
			type Crop = { id: string; panelId: string; head: { src: string }; full: { src: string } };
			return (comic?.characters ?? [])
				.flatMap((character: { images: Crop[] }) => character.images)
				.filter((image: Crop) => image.panelId === panelId)
				.map((image: Crop) => ({ id: image.id, head: image.head.src, full: image.full.src }));
		},
		{ comicId: EXAMPLE.id, panelId: PANEL.id },
	);
}

/** Generate a new image and wait until the stored image changed; returns its src. */
async function generate(page: Page, button: Locator): Promise<string> {
	const before = await panelImageSrc(page);
	await activate(page, button);
	await expect.poll(() => panelImageSrc(page)).not.toBe(before);
	const src = await panelImageSrc(page);
	if (!src) throw new Error('Expected a stored panel image');
	return src;
}

/** Remove the seeded image and generate A (stored in OPFS, nothing to restore). */
async function generateFirstImage(panelPage: PanelPage): Promise<string> {
	await activate(panelPage.page, panelPage.deleteImageButton);
	await expect(panelPage.createImageButton).toBeVisible();
	return generate(panelPage.page, panelPage.createImageButton);
}

/** Replace the current image with a new one; returns the new src. */
async function replace(panelPage: PanelPage): Promise<string> {
	const src = await generate(panelPage.page, panelPage.replaceImageButton);
	// Fail here, clearly, when the feature is missing, instead of tabbing 80 times later.
	await expect(panelPage.restoreImageButton).toBeVisible();
	return src;
}

test(
	'offers no restore for an image that was never replaced',
	{ tag: '@REQ-048' },
	async ({ page }) => {
		const panelPage = await new PanelPage(page).goto();

		await expect(panelPage.initialImage).toBeVisible();
		await expect(panelPage.restoreImageButton).toBeHidden();

		// A freshly generated image on an empty panel has nothing to restore either.
		await generateFirstImage(panelPage);
		await expect(panelPage.newImage).toBeVisible();
		await expect(panelPage.restoreImageButton).toBeHidden();
	},
);

test('offers to restore after the image is replaced', { tag: '@REQ-048' }, async ({ page }) => {
	const panelPage = await new PanelPage(page).goto();

	await replace(panelPage);

	await expect(panelPage.newImage).toBeVisible();
	await expect(panelPage.initialImage).toBeHidden();
	await expect(panelPage.restoreImageButton).toBeVisible();
});

test('restores the previous image with the keyboard', { tag: '@REQ-048' }, async ({ page }) => {
	const panelPage = await new PanelPage(page).goto();
	await replace(panelPage);

	await activate(page, panelPage.restoreImageButton);

	await expect(panelPage.initialImage).toBeVisible();
	await expect(panelPage.newImage).toBeHidden();
	await expect(panelPage.restoreImageButton).toBeHidden();
	// The bundled example file is shared: it is referenced again, never copied into OPFS.
	expect(await panelImageSrc(page)).toBe(PANEL.image?.landscape.src);
	await expect(page.locator(`img[src="${PANEL.image?.landscape.src}"]`).first()).toBeVisible();
});

test(
	'keeps the restorable image across a reload',
	{ tag: ['@REQ-048', '@REQ-022'] },
	async ({ page }) => {
		const panelPage = await new PanelPage(page).goto();
		await replace(panelPage);

		await page.reload();

		await expect(panelPage.newImage).toBeVisible();
		await expect(panelPage.restoreImageButton).toBeVisible();

		await activate(page, panelPage.restoreImageButton);

		await expect(panelPage.initialImage).toBeVisible();
		await expect(panelPage.restoreImageButton).toBeHidden();
	},
);

test(
	'restores only one step back and deletes the older file',
	{ tag: ['@REQ-048', '@REQ-025'] },
	async ({ page }) => {
		const panelPage = await new PanelPage(page).goto();
		const a = await generateFirstImage(panelPage);
		const b = await replace(panelPage);
		const c = await replace(panelPage);
		// Replacing again dropped A: only the newest previous image is kept.
		expect(await storedFiles(page)).not.toContain(a);
		expect(await storedFiles(page)).toContain(b);

		await activate(page, panelPage.restoreImageButton);

		await expect.poll(() => panelImageSrc(page)).toBe(b);
		await expect(panelPage.restoreImageButton).toBeHidden();
		const files = await storedFiles(page);
		expect(files).toContain(b);
		expect(files).not.toContain(a);
		expect(files).not.toContain(c);
	},
);

test(
	'removing the image drops the kept previous image too',
	{ tag: ['@REQ-025', '@REQ-048', '@REQ-017'] },
	async ({ page }) => {
		const panelPage = await new PanelPage(page).goto();
		const a = await generateFirstImage(panelPage);
		const b = await replace(panelPage);
		expect(await storedFiles(page)).toContain(a);

		await activate(page, panelPage.deleteImageButton);

		await expect(panelPage.createImageButton).toBeVisible();
		await expect(panelPage.restoreImageButton).toBeHidden();
		await expect.poll(() => panelImageSrc(page)).toBeUndefined();
		const files = await storedFiles(page);
		expect(files).not.toContain(a);
		expect(files).not.toContain(b);
	},
);

const DELETIONS = [
	{
		title: 'deleting the panel removes both image files',
		url: `/comic/${EXAMPLE.id}`,
		button: () => m.deletePanel({ number: 1 }),
	},
	{
		title: 'deleting the comic removes both image files',
		url: '/',
		button: () => m.deleteComic({ title: EXAMPLE.title }),
	},
];

for (const { title, url, button } of DELETIONS) {
	test(title, { tag: '@REQ-025' }, async ({ page }) => {
		const panelPage = await new PanelPage(page).goto();
		const a = await generateFirstImage(panelPage);
		const b = await replace(panelPage);
		expect(await storedFiles(page)).toContain(a);

		await gotoHydrated(page, url);
		await activate(page, page.getByRole('button', { name: button() }));

		await expectFilesGone(page, [a, b]);
	});
}

test(
	'restoring removes the crops of the replaced image and keeps the earlier ones',
	{ tag: ['@REQ-049', '@REQ-018', '@REQ-025'] },
	async ({ page }) => {
		const panelPage = await new PanelPage(page).goto();
		await generateFirstImage(panelPage);
		await expect(panelPage.dialogueCharacterImage).toHaveCount(PANEL.dialogue.length);
		const cropsFromA = await panelCrops(page);
		expect(cropsFromA.length).toBeGreaterThan(0);

		await replace(panelPage);
		const cropsAfterB = await panelCrops(page);
		const cropsFromB = cropsAfterB.filter((crop) => !cropsFromA.some((a) => a.id === crop.id));
		expect(cropsFromB.length).toBeGreaterThan(0);

		await activate(page, panelPage.restoreImageButton);
		await expect(panelPage.restoreImageButton).toBeHidden();

		await expect
			.poll(async () =>
				(await panelCrops(page)).map((crop) => crop.id).sort((a, b) => a.localeCompare(b)),
			)
			.toEqual(cropsFromA.map((crop) => crop.id).sort((a, b) => a.localeCompare(b)));
		const files = await storedFiles(page);
		for (const crop of cropsFromB) {
			expect(files).not.toContain(crop.head);
			expect(files).not.toContain(crop.full);
		}
		for (const crop of cropsFromA) {
			expect(files).toContain(crop.head);
			expect(files).toContain(crop.full);
		}
		await expect(panelPage.dialogueCharacterImage).toHaveCount(PANEL.dialogue.length);
	},
);

test(
	'shows the loader while restoring and ignores a second activation',
	{ tag: '@REQ-032' },
	async ({ page }) => {
		const panelPage = await new PanelPage(page).goto();
		await generateFirstImage(panelPage);
		const b = await replace(panelPage);
		// Slow file removal so the restore is still running when the second key press arrives.
		await page.evaluate(() => {
			const removed: string[] = [];
			(window as unknown as { __removed: string[] }).__removed = removed;
			const original = FileSystemDirectoryHandle.prototype.removeEntry;
			FileSystemDirectoryHandle.prototype.removeEntry = async function (name, options) {
				removed.push(name);
				await new Promise((resolve) => setTimeout(resolve, 1000));
				return original.call(this, name, options);
			};
		});

		await activate(page, panelPage.restoreImageButton);
		await page.keyboard.press('Enter');

		await expect(page.getByRole('progressbar')).toBeVisible();
		await expect(page.getByRole('progressbar')).toBeHidden();
		await expect(panelPage.restoreImageButton).toBeHidden();
		const removed = await page.evaluate(
			() => (window as unknown as { __removed: string[] }).__removed,
		);
		expect(removed.filter((name) => name === b)).toHaveLength(1);
	},
);
