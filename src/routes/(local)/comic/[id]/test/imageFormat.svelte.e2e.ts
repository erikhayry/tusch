import { expect, test } from '@playwright/test';
import { createComic } from '../../../../../tests/e2e/createdComic';
import { EXAMPLE_COMPLETE } from '../../../../../tests/e2e/examples';
import { gotoHydrated } from '../../../../../tests/e2e/gotoHydrated';
import {
	IMAGE_FORMATS,
	imageFormatSelect,
	selectedImageFormat,
	setImageFormat,
} from '../../../../../tests/e2e/imageFormat';

test(
	'a created comic and an example default to "Portrait and landscape"',
	{ tag: '@REQ-103-1' },
	async ({ page }) => {
		const comicId = await createComic(page);
		await gotoHydrated(page, `/comic/${comicId}`);

		await expect(imageFormatSelect(page)).toBeVisible();
		await expect.poll(() => selectedImageFormat(page)).toBe(IMAGE_FORMATS.both());

		// An existing comic has no format saved.
		await gotoHydrated(page, `/comic/${EXAMPLE_COMPLETE.id}`);
		await expect.poll(() => selectedImageFormat(page)).toBe(IMAGE_FORMATS.both());
	},
);

test(
	'the image format can be changed at any time and survives a reload',
	{ tag: ['@REQ-103-1', '@REQ-022'] },
	async ({ page }) => {
		const comicId = await createComic(page);

		await setImageFormat(page, comicId, 'landscape');
		await page.reload();
		await expect.poll(() => selectedImageFormat(page)).toBe(IMAGE_FORMATS.landscape());

		// Changing it again later works the same.
		await setImageFormat(page, comicId, 'portrait');
		await page.reload();
		await expect.poll(() => selectedImageFormat(page)).toBe(IMAGE_FORMATS.portrait());
	},
);
