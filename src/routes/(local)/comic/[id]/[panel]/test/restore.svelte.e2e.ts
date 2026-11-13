import { m } from '$lib/paraglide/messages';
import { expect, test, type Locator, type Page } from '@playwright/test';
import { EXAMPLES } from '../../../../../../examples/examples';
import { gotoHydrated } from '../../../../../../tests/e2e/gotoHydrated';
import { activate } from '../../../../../../tests/e2e/keyboard';
import { PanelPage } from './utils/panelPage';

const EXAMPLE = EXAMPLES[0];
const PANEL = EXAMPLE.panels[0];

/** File names currently stored in OPFS. */
function storedFiles(page: Page): Promise<string[]> {
	return page.evaluate(async () => {
		const root = await navigator.storage.getDirectory();
		const names: string[] = [];
		for await (const name of (root as unknown as { keys(): AsyncIterable<string> }).keys()) {
			names.push(name);
		}
		return names.sort();
	});
}

/** The stored src of the example panel's current image, if any. */
function panelImageSrc(page: Page): Promise<string | undefined> {
	return page.evaluate(
		({ comicId, panelId }) => {
			const { comics } = JSON.parse(localStorage.getItem('comics_db') ?? '{"comics":[]}');
			const comic = comics.find((c: { id: string }) => c.id === comicId);
			return comic?.panels.find((p: { id: string }) => p.id === panelId)?.image?.landscape.src;
		},
		{ comicId: EXAMPLE.id, panelId: PANEL.id },
	);
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
	{ tag: '@REQ-044' },
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

test('offers to restore after the image is replaced', { tag: '@REQ-044' }, async ({ page }) => {
	const panelPage = await new PanelPage(page).goto();

	await replace(panelPage);

	await expect(panelPage.newImage).toBeVisible();
	await expect(panelPage.initialImage).toBeHidden();
	await expect(panelPage.restoreImageButton).toBeVisible();
});

test('restores the previous image with the keyboard', { tag: '@REQ-044' }, async ({ page }) => {
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
	{ tag: ['@REQ-044', '@REQ-022'] },
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
	{ tag: ['@REQ-044', '@REQ-025'] },
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
	{ tag: ['@REQ-025', '@REQ-044', '@REQ-017'] },
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

test('deleting the panel removes both image files', { tag: '@REQ-025' }, async ({ page }) => {
	const panelPage = await new PanelPage(page).goto();
	const a = await generateFirstImage(panelPage);
	const b = await replace(panelPage);
	expect(await storedFiles(page)).toContain(a);

	await gotoHydrated(page, `/comic/${EXAMPLE.id}`);
	await activate(page, page.getByRole('button', { name: m.deletePanel({ number: 1 }) }));

	await expect
		.poll(async () => {
			const files = await storedFiles(page);
			return files.includes(a) || files.includes(b);
		})
		.toBe(false);
});

test('deleting the comic removes both image files', { tag: '@REQ-025' }, async ({ page }) => {
	const panelPage = await new PanelPage(page).goto();
	const a = await generateFirstImage(panelPage);
	const b = await replace(panelPage);
	expect(await storedFiles(page)).toContain(a);

	await gotoHydrated(page, '/');
	await activate(page, page.getByRole('button', { name: m.deleteComic({ title: EXAMPLE.title }) }));

	await expect
		.poll(async () => {
			const files = await storedFiles(page);
			return files.includes(a) || files.includes(b);
		})
		.toBe(false);
});

test(
	'restoring removes the crops of the replaced image and keeps the earlier ones',
	{ tag: ['@REQ-045', '@REQ-018', '@REQ-025'] },
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
			.poll(async () => (await panelCrops(page)).map((crop) => crop.id).sort())
			.toEqual(cropsFromA.map((crop) => crop.id).sort());
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
