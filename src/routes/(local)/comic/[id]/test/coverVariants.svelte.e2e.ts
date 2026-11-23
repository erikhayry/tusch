import { m } from '#lib/paraglide/messages.js';
import { expect, test, type Locator, type Page } from '@playwright/test';
import { errorRegion, submitWithInstructions } from '../../../../../tests/e2e/aiFailures';
import { createComic, storedComic } from '../../../../../tests/e2e/createdComic';
import { EXAMPLE_COMPLETE } from '../../../../../tests/e2e/examples';
import { gotoHydrated } from '../../../../../tests/e2e/gotoHydrated';
import {
	NO_LANDSCAPE,
	orientationOf,
	orientationsOf,
	setImageFormat,
	variantCaption,
	type ImageFormat,
} from '../../../../../tests/e2e/imageFormat';
import { activate } from '../../../../../tests/e2e/keyboard';
import { storedFiles } from '../../../../../tests/e2e/storage';
import { LandingPage } from '../../../test/utils/landingPage';

const createButton = (page: Page, variant: 'portrait' | 'landscape') =>
	page.getByRole('button', {
		name: variant === 'portrait' ? m.createPortraitCover() : m.createLandscapeCover(),
		exact: true,
	});

const removeVariantButton = (page: Page, variant: 'portrait' | 'landscape') =>
	page.getByRole('button', {
		name: variant === 'portrait' ? m.removePortraitCover() : m.removeLandscapeCover(),
		exact: true,
	});

const deleteCoverButton = (page: Page) =>
	page.getByRole('button', { name: m.deleteCover(), exact: true });

/** The comic page's cover images: they share the cover's alt text. */
const coverImages = (page: Page, alt: string): Locator =>
	page.getByRole('img', { name: alt, exact: true });

/** Fail on the missing button, not on a timeout while tabbing for it. */
async function press(page: Page, button: Locator) {
	await expect(button).toBeVisible();
	await activate(page, button);
}

/** A created comic with the format, its cover deleted so "Add Cover" makes a new one. */
async function comicWithoutCover(page: Page, format: ImageFormat) {
	const comicId = await createComic(page);
	if (format !== 'both') {
		await setImageFormat(page, comicId, format);
	}
	await gotoHydrated(page, `/comic/${comicId}`);
	await press(page, deleteCoverButton(page));
	await expect(page.getByRole('button', { name: m.addCover(), exact: true })).toBeVisible();
	expect((await storedComic(page, comicId)).cover).toBeUndefined();
	return comicId;
}

async function storedCover(page: Page, comicId: string) {
	const { cover } = await storedComic(page, comicId);
	if (!cover) {
		throw new Error('comic has no cover');
	}
	return cover;
}

test(
	'a new comic opens with a portrait and a landscape cover',
	{ tag: ['@REQ-006', '@REQ-280-1'] },
	async ({ page }) => {
		const comicId = await createComic(page);
		const cover = await storedCover(page, comicId);
		expect(cover.portrait).toBeDefined();
		expect(cover.landscape).toBeDefined();

		await expect(coverImages(page, cover.alt)).toHaveCount(2);
		expect(await orientationsOf(coverImages(page, cover.alt))).toEqual(['landscape', 'portrait']);
		await expect(variantCaption(page, 'portrait')).toBeVisible();
		await expect(variantCaption(page, 'landscape')).toBeVisible();
	},
);

test(
	'"Landscape only" generates only a landscape cover, and the landing page shows it',
	{ tag: ['@REQ-011', '@REQ-001', '@REQ-280-1'] },
	async ({ page }) => {
		const comicId = await comicWithoutCover(page, 'landscape');

		await activate(page, page.getByRole('button', { name: m.addCover(), exact: true }));

		await expect.poll(async () => (await storedComic(page, comicId)).cover).toBeDefined();
		const cover = await storedCover(page, comicId);
		await expect(coverImages(page, cover.alt)).toHaveCount(1);
		expect(await orientationsOf(coverImages(page, cover.alt))).toEqual(['landscape']);
		await expect(variantCaption(page, 'landscape')).toBeVisible();
		await expect(variantCaption(page, 'portrait')).toBeHidden();
		expect(cover.portrait).toBeUndefined();

		const { title } = await storedComic(page, comicId);
		const landing = await new LandingPage(page).goto();
		const image = landing.comicLink(title).locator('img');
		await expect(image).toBeVisible();
		expect(await orientationOf(image)).toBe('landscape');
	},
);

test(
	'a failed landscape cover keeps the portrait cover and shows the error',
	{ tag: '@REQ-011' },
	async ({ page }) => {
		const comicId = await comicWithoutCover(page, 'both');

		await submitWithInstructions(
			page,
			page.getByRole('button', { name: m.addCover(), exact: true }),
			NO_LANDSCAPE,
		);

		await expect(errorRegion(page)).toContainText(m.landscapeImageFailed());
		await expect.poll(async () => (await storedComic(page, comicId)).cover).toBeDefined();
		const cover = await storedCover(page, comicId);
		expect(cover.portrait).toBeDefined();
		expect(cover.landscape).toBeUndefined();
		await expect(coverImages(page, cover.alt)).toHaveCount(1);
		expect(await orientationsOf(coverImages(page, cover.alt))).toEqual(['portrait']);
		await expect(variantCaption(page, 'portrait')).toBeVisible();
	},
);

test(
	'an example comic offers to create its landscape cover',
	{ tag: '@REQ-280-1' },
	async ({ page }) => {
		await gotoHydrated(page, `/comic/${EXAMPLE_COMPLETE.id}`);
		const before = await storedCover(page, EXAMPLE_COMPLETE.id);
		await expect(createButton(page, 'portrait')).toBeHidden();

		await press(page, createButton(page, 'landscape'));

		await expect(coverImages(page, before.alt)).toHaveCount(2);
		await expect(createButton(page, 'landscape')).toBeHidden();
		expect(await orientationsOf(coverImages(page, before.alt))).toEqual(['landscape', 'portrait']);
		await expect(variantCaption(page, 'landscape')).toBeVisible();
		// Only the missing variant was made: the portrait is the same file.
		const after = await storedCover(page, EXAMPLE_COMPLETE.id);
		expect(after.portrait?.src).toBe(before.portrait?.src);
		expect(after.landscape?.src).toBeTruthy();
	},
);

test(
	'removing the portrait cover keeps the landscape cover and deletes the portrait file',
	{ tag: ['@REQ-280-1', '@REQ-025'] },
	async ({ page }) => {
		const comicId = await createComic(page);
		const before = await storedCover(page, comicId);
		const portraitFile = before.portrait?.src;
		expect(portraitFile).toBeTruthy();
		expect(await storedFiles(page)).toContain(portraitFile);
		// Two variants: the per-variant buttons, not "Delete Cover".
		await expect(deleteCoverButton(page)).toBeHidden();

		await press(page, removeVariantButton(page, 'portrait'));

		await expect(coverImages(page, before.alt)).toHaveCount(1);
		expect(await orientationsOf(coverImages(page, before.alt))).toEqual(['landscape']);
		await expect(variantCaption(page, 'portrait')).toBeHidden();
		expect(await storedFiles(page)).not.toContain(portraitFile);
		const after = await storedCover(page, comicId);
		expect(after.portrait).toBeUndefined();
		expect(after.landscape?.src).toBe(before.landscape?.src);
		// One variant left: "Delete Cover" applies, and no variant button is left.
		await expect(deleteCoverButton(page)).toBeVisible();
		await expect(removeVariantButton(page, 'landscape')).toBeHidden();
	},
);
