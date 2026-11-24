import { m } from '#lib/paraglide/messages.js';
import { expect, type Locator, type Page } from '@playwright/test';
import { createComic, imagesFromPanel, storedComic } from './createdComic';
import { gotoHydrated } from './gotoHydrated';
import { activate, chooseOption } from './keyboard';

/** The comic's image format choices, as the user sees them (REQ-103-1). */
export const IMAGE_FORMATS = {
	both: () => m.imageFormatBoth(),
	portrait: () => m.imageFormatPortrait(),
	landscape: () => m.imageFormatLandscape(),
};
export type ImageFormat = keyof typeof IMAGE_FORMATS;

/** Mock markers that fail one variant's image request (`docs/rules/testing.md`). */
export const NO_PORTRAIT = 'mock-error:no-portrait';
export const NO_LANDSCAPE = 'mock-error:no-landscape';

/** The mock's alt text, shared by every generated panel image. */
export const MOCK_IMAGE_ALT = 'mock alt text';

export const imageFormatSelect = (page: Page) =>
	page.getByRole('combobox', { name: m.imageFormat(), exact: true });

/** The label of the option the select shows. */
export const selectedImageFormat = (page: Page) =>
	imageFormatSelect(page).evaluate(
		(element) => (element as HTMLSelectElement).selectedOptions[0]?.textContent?.trim() ?? '',
	);

export const saveImageFormatButton = (page: Page) =>
	page.getByRole('button', { name: m.saveImageFormat(), exact: true });

/** Choose the comic's image format on its page and save it, with the keyboard. */
export async function setImageFormat(page: Page, comicId: string, format: ImageFormat) {
	await gotoHydrated(page, `/comic/${comicId}`);
	// Fail here, clearly, when the setting is missing, instead of tabbing 80 times.
	await expect(imageFormatSelect(page)).toBeVisible();
	await chooseOption(page, imageFormatSelect(page), IMAGE_FORMATS[format]());
	await expect.poll(() => selectedImageFormat(page)).toBe(IMAGE_FORMATS[format]());
	await activate(page, saveImageFormatButton(page));
	// The save is a client command: wait until it is stored, or a navigation or reload can outrun it.
	await expect.poll(async () => (await storedComic(page, comicId)).imageFormat).toBe(format);
}

/** A comic made through the UI with the given image format, and its first panel (no image yet). */
export async function createComicWithFormat(page: Page, format: ImageFormat) {
	const comicId = await createComic(page);
	if (format !== 'both') {
		await setImageFormat(page, comicId, format);
	}
	const panel = (await storedComic(page, comicId)).panels[0];
	if (!panel) {
		throw new Error('created comic has no panel');
	}
	return { comicId, panelId: panel.id };
}

/** The panel page's generated images (the mock gives every one the same alt text). */
export const panelImages = (page: Page) =>
	page.getByRole('img', { name: MOCK_IMAGE_ALT, exact: true });

/** The caption a stored variant shows on the panel page (REQ-103-4). */
export const variantCaption = (page: Page, variant: 'portrait' | 'landscape') =>
	page.getByText(variant === 'portrait' ? m.portraitImage() : m.landscapeImage(), {
		exact: true,
	});

/** Which way a loaded image is oriented, from its natural size. */
export async function orientationOf(image: Locator): Promise<'portrait' | 'landscape'> {
	const size = await image.evaluate((element) => ({
		width: (element as HTMLImageElement).naturalWidth,
		height: (element as HTMLImageElement).naturalHeight,
	}));
	return size.width > size.height ? 'landscape' : 'portrait';
}

/** The orientations of the given images, once they have all loaded. */
export async function orientationsOf(images: Locator): Promise<string[]> {
	await expect
		.poll(() =>
			images.evaluateAll((elements) =>
				elements.every((element) => (element as HTMLImageElement).naturalWidth > 0),
			),
		)
		.toBe(true);
	const orientations = await Promise.all((await images.all()).map(orientationOf));
	return orientations.sort((a, b) => a.localeCompare(b));
}

/** A created comic whose first panel has an image made under `format` (what a user does). */
export async function comicWithImage(page: Page, format: ImageFormat) {
	const { comicId, panelId } = await createComicWithFormat(page, format);
	await gotoHydrated(page, `/comic/${comicId}/${panelId}`);
	await activate(page, page.getByRole('button', { name: m.addImage() }));
	await expect(panelImages(page).first()).toBeVisible();
	await expect
		.poll(async () => imagesFromPanel(await storedComic(page, comicId), panelId).length)
		.toBeGreaterThan(0);
	return { comicId, panelId };
}
