import { m } from '#lib/paraglide/messages.js';
import { expect, test, type Locator, type Page } from '@playwright/test';
import {
	NO_IMAGE,
	errorRegion,
	submitWithInstructions,
} from '../../../../../../tests/e2e/aiFailures';
import { imagesFromPanel, storedComic } from '../../../../../../tests/e2e/createdComic';
import { gotoHydrated } from '../../../../../../tests/e2e/gotoHydrated';
import {
	createComicWithFormat,
	orientationsOf,
	panelImages,
	setImageFormat,
	variantCaption,
	type ImageFormat,
} from '../../../../../../tests/e2e/imageFormat';
import { activate } from '../../../../../../tests/e2e/keyboard';
import { storedFiles } from '../../../../../../tests/e2e/storage';
import { PanelPage } from './utils/panelPage';

const createButton = (page: Page, variant: 'portrait' | 'landscape') =>
	page.getByRole('button', {
		name: variant === 'portrait' ? m.createPortraitImage() : m.createLandscapeImage(),
		exact: true,
	});

const removeVariantButton = (page: Page, variant: 'portrait' | 'landscape') =>
	page.getByRole('button', {
		name: variant === 'portrait' ? m.removePortraitImage() : m.removeLandscapeImage(),
		exact: true,
	});

/** Fail on the missing button, not on a timeout while tabbing for it. */
async function press(page: Page, button: Locator) {
	await expect(button).toBeVisible();
	await activate(page, button);
}

/** A created comic whose first panel has an image made under `format` (what a user does). */
async function comicWithImage(page: Page, format: ImageFormat) {
	const { comicId, panelId } = await createComicWithFormat(page, format);
	await gotoHydrated(page, `/comic/${comicId}/${panelId}`);
	await activate(page, page.getByRole('button', { name: m.addImage() }));
	await expect(panelImages(page).first()).toBeVisible();
	await expect
		.poll(async () => imagesFromPanel(await storedComic(page, comicId), panelId).length)
		.toBeGreaterThan(0);
	return { comicId, panelId };
}

async function storedImage(page: Page, comicId: string, panelId: string) {
	return (await storedComic(page, comicId)).panels.find((p) => p.id === panelId)?.image;
}

/** Head and full crop files stored for the panel, with the crop ids. */
async function panelCrops(page: Page, comicId: string, panelId: string) {
	return imagesFromPanel(await storedComic(page, comicId), panelId).map((crop) => ({
		id: crop.id,
		files: [crop.head.src, crop.full.src],
	}));
}

test(
	'a portrait-only image gets its landscape variant after the format changes to both',
	{ tag: ['@REQ-279-1', '@REQ-103-2'] },
	async ({ page }) => {
		const { comicId, panelId } = await comicWithImage(page, 'portrait');
		const before = await storedImage(page, comicId, panelId);
		await setImageFormat(page, comicId, 'both');
		await gotoHydrated(page, `/comic/${comicId}/${panelId}`);
		await expect(panelImages(page)).toHaveCount(1);
		await expect(createButton(page, 'portrait')).toBeHidden();

		await press(page, createButton(page, 'landscape'));

		await expect(panelImages(page)).toHaveCount(2);
		expect(await orientationsOf(panelImages(page))).toEqual(['landscape', 'portrait']);
		await expect(variantCaption(page, 'portrait')).toBeVisible();
		await expect(variantCaption(page, 'landscape')).toBeVisible();
		await expect(createButton(page, 'landscape')).toBeHidden();
		// Only the missing variant was made: the portrait is the same stored file.
		const after = await storedImage(page, comicId, panelId);
		expect(after?.portrait?.src).toBe(before?.portrait?.src);
		expect(after?.landscape?.src).toBeTruthy();
	},
);

test(
	'a landscape-only image gets its portrait variant after the format changes to both',
	{ tag: ['@REQ-279-1', '@REQ-103-2'] },
	async ({ page }) => {
		const { comicId, panelId } = await comicWithImage(page, 'landscape');
		const before = await storedImage(page, comicId, panelId);
		await setImageFormat(page, comicId, 'both');
		await gotoHydrated(page, `/comic/${comicId}/${panelId}`);
		await expect(createButton(page, 'landscape')).toBeHidden();

		await press(page, createButton(page, 'portrait'));

		await expect(panelImages(page)).toHaveCount(2);
		expect(await orientationsOf(panelImages(page))).toEqual(['landscape', 'portrait']);
		const after = await storedImage(page, comicId, panelId);
		expect(after?.landscape?.src).toBe(before?.landscape?.src);
	},
);

test(
	'an example comic, with images made before #103, offers to create the landscape image',
	{ tag: '@REQ-279-1' },
	async ({ page }) => {
		const panelPage = await new PanelPage(page).goto();

		await expect(panelPage.initialImage).toBeVisible();
		await expect(createButton(page, 'landscape')).toBeVisible();
		await expect(createButton(page, 'portrait')).toBeHidden();
	},
);

test('a "Portrait only" comic offers no create button', { tag: '@REQ-279-1' }, async ({ page }) => {
	const { comicId, panelId } = await comicWithImage(page, 'portrait');
	await gotoHydrated(page, `/comic/${comicId}/${panelId}`);
	await expect(panelImages(page)).toHaveCount(1);

	await expect(createButton(page, 'landscape')).toBeHidden();
	await expect(createButton(page, 'portrait')).toBeHidden();
});

test(
	'a panel without an image offers no create button',
	{ tag: '@REQ-279-1' },
	async ({ page }) => {
		const { comicId, panelId } = await createComicWithFormat(page, 'both');
		await gotoHydrated(page, `/comic/${comicId}/${panelId}`);
		await expect(page.getByRole('button', { name: m.addImage() })).toBeVisible();

		await expect(createButton(page, 'landscape')).toBeHidden();
		await expect(createButton(page, 'portrait')).toBeHidden();
	},
);

test(
	'a failed create keeps the existing image and shows the error',
	{ tag: ['@REQ-279-1', '@REQ-185-1'] },
	async ({ page }) => {
		const { comicId, panelId } = await comicWithImage(page, 'portrait');
		await setImageFormat(page, comicId, 'both');
		await gotoHydrated(page, `/comic/${comicId}/${panelId}`);
		const before = await storedImage(page, comicId, panelId);
		const filesBefore = await storedFiles(page);

		await expect(createButton(page, 'landscape')).toBeVisible();
		await submitWithInstructions(page, createButton(page, 'landscape'), NO_IMAGE);

		await expect(errorRegion(page)).toBeVisible();
		await expect(panelImages(page)).toHaveCount(1);
		expect(await orientationsOf(panelImages(page))).toEqual(['portrait']);
		expect(await storedImage(page, comicId, panelId)).toEqual(before);
		expect(await storedFiles(page)).toEqual(filesBefore);
	},
);

test(
	'creating the missing portrait variant replaces the crops from the landscape image',
	{ tag: ['@REQ-279-3', '@REQ-018', '@REQ-025'] },
	async ({ page }) => {
		const { comicId, panelId } = await comicWithImage(page, 'landscape');
		const cropsBefore = await panelCrops(page, comicId, panelId);
		expect(cropsBefore.length).toBeGreaterThan(0);
		await setImageFormat(page, comicId, 'both');
		await gotoHydrated(page, `/comic/${comicId}/${panelId}`);

		await press(page, createButton(page, 'portrait'));
		await expect(panelImages(page)).toHaveCount(2);

		await expect
			.poll(async () => {
				const ids = (await panelCrops(page, comicId, panelId)).map((crop) => crop.id);
				return ids.length > 0 && ids.every((id) => !cropsBefore.some((crop) => crop.id === id));
			})
			.toBe(true);
		const files = await storedFiles(page);
		for (const file of cropsBefore.flatMap((crop) => crop.files)) {
			expect(files).not.toContain(file);
		}
	},
);

const REMOVALS = [
	{ removed: 'landscape', kept: 'portrait' },
	{ removed: 'portrait', kept: 'landscape' },
] as const;

for (const { removed, kept } of REMOVALS) {
	test(
		`removing the ${removed} image keeps the ${kept} image and deletes the ${removed} file`,
		{ tag: ['@REQ-279-2', '@REQ-025', '@REQ-017'] },
		async ({ page }) => {
			const { comicId, panelId } = await comicWithImage(page, 'both');
			await expect(panelImages(page)).toHaveCount(2);
			const before = await storedImage(page, comicId, panelId);
			const removedFile = before?.[removed]?.src;
			expect(removedFile).toBeTruthy();
			expect(await storedFiles(page)).toContain(removedFile);
			// Two variants: the per-variant buttons, not the plain "Remove image".
			await expect(page.getByRole('button', { name: m.removeImage(), exact: true })).toBeHidden();

			await press(page, removeVariantButton(page, removed));

			await expect(panelImages(page)).toHaveCount(1);
			expect(await orientationsOf(panelImages(page))).toEqual([kept]);
			await expect(variantCaption(page, removed)).toBeHidden();
			await expect(variantCaption(page, kept)).toBeVisible();
			expect(await storedFiles(page)).not.toContain(removedFile);
			const after = await storedImage(page, comicId, panelId);
			expect(after?.[kept]?.src).toBe(before?.[kept]?.src);
			expect(after?.[removed]).toBeUndefined();
			// One variant left: the existing "Remove image" applies, and no variant button is left.
			await expect(page.getByRole('button', { name: m.removeImage(), exact: true })).toBeVisible();
			await expect(removeVariantButton(page, kept)).toBeHidden();
			// Not a replacement: no restore point.
			await expect(page.getByRole('button', { name: m.restorePreviousImage() })).toBeHidden();
		},
	);
}

test(
	'removing the portrait image moves the dialogue heads to crops from the landscape image',
	{ tag: ['@REQ-279-3', '@REQ-018', '@REQ-025'] },
	async ({ page }) => {
		await PanelPage.recordImageFileNames(page);
		const { comicId, panelId } = await comicWithImage(page, 'both');
		await expect(panelImages(page)).toHaveCount(2);
		const panelPage = new PanelPage(page);
		await expect(panelPage.dialogueCharacterImage.first()).toBeVisible();
		const cropsBefore = await panelCrops(page, comicId, panelId);
		expect(cropsBefore.length).toBeGreaterThan(0);

		await press(page, removeVariantButton(page, 'portrait'));
		await expect(panelImages(page)).toHaveCount(1);

		await expect
			.poll(async () => {
				const ids = (await panelCrops(page, comicId, panelId)).map((crop) => crop.id);
				return ids.length > 0 && ids.every((id) => !cropsBefore.some((crop) => crop.id === id));
			})
			.toBe(true);
		const heads = (await panelCrops(page, comicId, panelId)).map((crop) => crop.files[0]);
		await expect(panelPage.dialogueCharacterImage.first()).toBeVisible();
		const shown = await panelPage.dialogueCharacterImageFileNames();
		expect(shown.length).toBeGreaterThan(0);
		for (const name of shown) {
			expect(heads).toContain(name);
		}
		const files = await storedFiles(page);
		for (const file of cropsBefore.flatMap((crop) => crop.files)) {
			expect(files).not.toContain(file);
		}
	},
);
