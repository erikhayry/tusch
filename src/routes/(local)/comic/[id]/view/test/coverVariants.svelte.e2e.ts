import { expect, test } from '@playwright/test';
import { createComic } from '../../../../../../tests/e2e/createdComic';
import { orientationOf } from '../../../../../../tests/e2e/imageFormat';
import { ViewPage } from './utils/viewPage';

test(
	'a cover with both variants shows the one that fits the viewport',
	{ tag: '@REQ-280-2' },
	async ({ page }) => {
		const comicId = await createComic(page);

		for (const { viewport, expected } of [
			{ viewport: { width: 1280, height: 720 }, expected: 'landscape' },
			{ viewport: { width: 390, height: 844 }, expected: 'portrait' },
		] as const) {
			await page.setViewportSize(viewport);
			await new ViewPage(page, comicId).goto();

			// The comic has no panel images yet, so the only <picture> is the cover.
			const picture = page.locator('picture');
			await expect(picture).toHaveCount(1);
			const image = picture.getByRole('img');
			await expect(image).toBeVisible();
			await expect
				.poll(() => image.evaluate((element) => (element as HTMLImageElement).naturalWidth))
				.toBeGreaterThan(0);
			expect(await orientationOf(image)).toBe(expected);
		}
	},
);
