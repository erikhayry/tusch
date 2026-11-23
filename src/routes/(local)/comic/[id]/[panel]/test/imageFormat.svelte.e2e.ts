import { m } from '#lib/paraglide/messages.js';
import { expect, test, type Page } from '@playwright/test';
import {
	NO_IMAGE,
	errorRegion,
	submitWithInstructions,
} from '../../../../../../tests/e2e/aiFailures';
import {
	currentImagePreview,
	imagesFromPanel,
	storedComic,
} from '../../../../../../tests/e2e/createdComic';
import { gotoHydrated } from '../../../../../../tests/e2e/gotoHydrated';
import {
	NO_LANDSCAPE,
	NO_PORTRAIT,
	createComicWithFormat,
	orientationsOf,
	panelImages,
	variantCaption,
	type ImageFormat,
} from '../../../../../../tests/e2e/imageFormat';
import { activate } from '../../../../../../tests/e2e/keyboard';
import { storedFiles } from '../../../../../../tests/e2e/storage';

/** Create a comic with `format`, open its first panel and generate the image (optionally with instructions). */
async function generateOnCreatedComic(page: Page, format: ImageFormat, instructions?: string) {
	const { comicId, panelId } = await createComicWithFormat(page, format);
	await gotoHydrated(page, `/comic/${comicId}/${panelId}`);
	const addImage = page.getByRole('button', { name: m.addImage() });
	if (instructions === undefined) {
		await activate(page, addImage);
	} else {
		await submitWithInstructions(page, addImage, instructions);
	}
	return { comicId, panelId };
}

test(
	'a "Portrait and landscape" comic gets a portrait and a landscape image, each captioned',
	{ tag: ['@REQ-103-2', '@REQ-103-4', '@REQ-015'] },
	async ({ page }) => {
		await generateOnCreatedComic(page, 'both');

		await expect(panelImages(page)).toHaveCount(2);
		expect(await orientationsOf(panelImages(page))).toEqual(['landscape', 'portrait']);
		await expect(variantCaption(page, 'portrait')).toBeVisible();
		await expect(variantCaption(page, 'landscape')).toBeVisible();
	},
);

const SINGLE_VARIANTS = [
	{ format: 'portrait', shown: 'portrait', hidden: 'landscape' },
	{ format: 'landscape', shown: 'landscape', hidden: 'portrait' },
] as const;

for (const { format, shown, hidden } of SINGLE_VARIANTS) {
	test(
		`a ${format}-only comic gets only the ${shown} image`,
		{ tag: ['@REQ-103-2', '@REQ-103-4', '@REQ-015'] },
		async ({ page }) => {
			await generateOnCreatedComic(page, format);

			await expect(panelImages(page)).toHaveCount(1);
			expect(await orientationsOf(panelImages(page))).toEqual([shown]);
			await expect(variantCaption(page, shown)).toBeVisible();
			await expect(variantCaption(page, hidden)).toBeHidden();
		},
	);
}

const PARTIAL_FAILURES = [
	{ marker: NO_LANDSCAPE, kept: 'portrait', failed: () => m.landscapeImageFailed() },
	{ marker: NO_PORTRAIT, kept: 'landscape', failed: () => m.portraitImageFailed() },
] as const;

for (const { marker, kept, failed } of PARTIAL_FAILURES) {
	test(
		`${marker} saves the ${kept} image and says which variant failed`,
		{ tag: ['@REQ-103-3', '@REQ-185-1'] },
		async ({ page }) => {
			const { comicId, panelId } = await generateOnCreatedComic(page, 'both', marker);

			await expect(errorRegion(page)).toContainText(failed());
			await expect(panelImages(page)).toHaveCount(1);
			expect(await orientationsOf(panelImages(page))).toEqual([kept]);
			await expect(variantCaption(page, kept)).toBeVisible();

			// Saved, not just shown: it is still there after a reload.
			await page.reload();
			await expect(panelImages(page)).toHaveCount(1);
			expect(await orientationsOf(panelImages(page))).toEqual([kept]);
			expect(
				(await storedComic(page, comicId)).panels.find((p) => p.id === panelId)?.image,
			).toBeDefined();
		},
	);
}

test(
	'when every variant fails nothing is saved',
	{ tag: ['@REQ-103-3', '@REQ-025'] },
	async ({ page }) => {
		const { comicId, panelId } = await createComicWithFormat(page, 'both');
		const filesBefore = await storedFiles(page);
		await gotoHydrated(page, `/comic/${comicId}/${panelId}`);

		await submitWithInstructions(page, page.getByRole('button', { name: m.addImage() }), NO_IMAGE);

		await expect(errorRegion(page)).toBeVisible();
		await expect(panelImages(page)).toHaveCount(0);
		expect(await storedFiles(page)).toEqual(filesBefore);
		const panel = (await storedComic(page, comicId)).panels.find((p) => p.id === panelId);
		expect(panel?.image).toBeUndefined();
	},
);

test(
	'a landscape-only comic cuts character crops from the landscape image',
	{ tag: ['@REQ-018', '@REQ-103-2'] },
	async ({ page }) => {
		const { comicId, panelId } = await generateOnCreatedComic(page, 'landscape');

		await expect(panelImages(page)).toHaveCount(1);
		await expect
			.poll(async () => imagesFromPanel(await storedComic(page, comicId), panelId).length)
			.toBeGreaterThan(0);
		// The crops were measured on the landscape image: the head shown next to the dialogue is a real image.
		const heads = page.getByRole('list', { name: m.dialogues() }).getByRole('img');
		await expect(heads.first()).toBeVisible();
		await expect.poll(() => orientationsOf(heads).then((o) => o.length)).toBeGreaterThan(0);
	},
);

test(
	'restoring brings back both variants of the previous image',
	{ tag: ['@REQ-048', '@REQ-103-2', '@REQ-025'] },
	async ({ page }) => {
		const { comicId, panelId } = await generateOnCreatedComic(page, 'both');
		await expect(panelImages(page)).toHaveCount(2);
		await expect
			.poll(async () => imagesFromPanel(await storedComic(page, comicId), panelId).length)
			.toBeGreaterThan(0);
		const filesA = await storedFiles(page);

		await activate(page, page.getByRole('button', { name: m.generateNewImage() }));
		const restore = page.getByRole('button', { name: m.restorePreviousImage() });
		await expect(restore).toBeVisible();
		// A and B, two variants each.
		await expect.poll(async () => (await storedFiles(page)).length).toBeGreaterThan(filesA.length);

		await activate(page, restore);

		await expect(restore).toBeHidden();
		await expect(panelImages(page)).toHaveCount(2);
		expect(await orientationsOf(panelImages(page))).toEqual(['landscape', 'portrait']);
		await expect(variantCaption(page, 'portrait')).toBeVisible();
		await expect(variantCaption(page, 'landscape')).toBeVisible();
		// Exactly the files of the first image: B's variants and crops are gone.
		await expect.poll(() => storedFiles(page)).toEqual(filesA);
	},
);

const PREVIEWS = [
	{ format: 'both', width: '50', height: '75' },
	{ format: 'portrait', width: '50', height: '75' },
	{ format: 'landscape', width: '75', height: '50' },
] as const;

for (const { format, width, height } of PREVIEWS) {
	test(
		`the current-image preview of a ${format} comic is ${width}×${height}`,
		{ tag: '@REQ-172-1' },
		async ({ page }) => {
			await generateOnCreatedComic(page, format);
			await expect(panelImages(page).first()).toBeVisible();

			const preview = currentImagePreview(page);
			await expect(preview).toHaveAttribute('width', width);
			await expect(preview).toHaveAttribute('height', height);
			await expect.poll(async () => (await preview.boundingBox())?.width).toBe(Number(width));
			// The preview shows the portrait variant if there is one.
			expect(await orientationsOf(preview)).toEqual([
				format === 'landscape' ? 'landscape' : 'portrait',
			]);
		},
	);
}
