import { expect, test, type Page } from '@playwright/test';
import { generatePanelImage, storedComic } from '../../../../../../tests/e2e/createdComic';
import {
	createComicWithFormat,
	orientationOf,
	type ImageFormat,
} from '../../../../../../tests/e2e/imageFormat';
import { ViewPage } from './utils/viewPage';

const LANDSCAPE_VIEWPORT = { width: 1280, height: 720 };
const PORTRAIT_VIEWPORT = { width: 390, height: 844 };

/** Panel 1's image in the viewer, once it has loaded. */
async function panelOneImage(page: Page, comicId: string) {
	const view = new ViewPage(page, comicId);
	const image = page.locator('section', { has: view.panelHeading(1) }).getByRole('img');
	await expect(image).toBeVisible();
	await expect
		.poll(() => image.evaluate((element) => (element as HTMLImageElement).naturalWidth))
		.toBeGreaterThan(0);
	return image;
}

async function viewerWith(page: Page, format: ImageFormat) {
	const { comicId, panelId } = await createComicWithFormat(page, format);
	await generatePanelImage(page, comicId, panelId);
	expect((await storedComic(page, comicId)).panels[0].image).toBeDefined();
	return comicId;
}

test(
	'a panel with both variants shows the one that fits the viewport',
	{ tag: ['@REQ-103-5', '@REQ-87-2'] },
	async ({ page }) => {
		const comicId = await viewerWith(page, 'both');

		for (const { viewport, expected } of [
			{ viewport: LANDSCAPE_VIEWPORT, expected: 'landscape' },
			{ viewport: PORTRAIT_VIEWPORT, expected: 'portrait' },
		] as const) {
			await page.setViewportSize(viewport);
			await new ViewPage(page, comicId).goto();

			const image = await panelOneImage(page, comicId);
			// A <picture> picks the file; the <img> inside it is what the reader sees.
			await expect(page.locator('picture')).toHaveCount(1);
			await expect(page.locator('picture').getByRole('img')).toHaveCount(1);
			expect(await orientationOf(image)).toBe(expected);
		}
	},
);

for (const format of ['portrait', 'landscape'] as const) {
	test(
		`a panel with only the ${format} variant shows it at every size`,
		{ tag: '@REQ-103-5' },
		async ({ page }) => {
			const comicId = await viewerWith(page, format);

			for (const viewport of [LANDSCAPE_VIEWPORT, PORTRAIT_VIEWPORT]) {
				await page.setViewportSize(viewport);
				await new ViewPage(page, comicId).goto();

				expect(await orientationOf(await panelOneImage(page, comicId))).toBe(format);
			}
		},
	);
}
