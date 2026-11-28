import { expect, test, type Locator, type Page } from '@playwright/test';
import { createComic, createComicAtFirstPanel, generatePanelImage } from './createdComic';
import { gotoHydrated } from './gotoHydrated';
import { createComicWithFormat } from './imageFormat';

const REM = 16;
const WIDE_CAP = 118.75 * REM;
const READER_CAP = 70 * REM;
const FORM_CAP = 45 * REM;

async function box(locator: Locator) {
	const found = await locator.boundingBox();
	if (!found) {
		throw new Error('element has no box');
	}
	return found;
}

/** Pages that read local comic state, for a comic the user created. */
async function widePages(page: Page) {
	const { comicId, panelId } = await createComicAtFirstPanel(page);
	return [
		'/',
		'/comic/create',
		`/comic/${comicId}`,
		`/comic/${comicId}/${panelId}`,
		`/comic/${comicId}/raw`,
	];
}

test.describe('wide container at 2400 px', () => {
	test.use({ viewport: { width: 2400, height: 1200 } });

	test(
		'main is 1900 px, centred, and the header shares its edges',
		{ tag: '@REQ-330-1' },
		async ({ page }) => {
			for (const url of await widePages(page)) {
				await gotoHydrated(page, url);
				const main = await box(page.locator('main'));
				const bar = await box(page.locator('header .bar'));
				expect(main.width, url).toBe(WIDE_CAP);
				expect(main.x, url).toBe((2400 - WIDE_CAP) / 2);
				expect(bar.x, url).toBe(main.x);
				expect(bar.width, url).toBe(main.width);
			}
		},
	);

	test(
		'the viewer main and reader bar stay 70rem wide',
		{ tag: '@REQ-330-2' },
		async ({ page }) => {
			const comicId = await createComic(page);
			await gotoHydrated(page, `/comic/${comicId}/view`);
			expect((await box(page.locator('main'))).width).toBe(READER_CAP);
			expect((await box(page.locator('.reader-header .bar'))).width).toBe(READER_CAP);
		},
	);

	test('the settings form stays 45rem wide', { tag: '@REQ-330-2' }, async ({ page }) => {
		await gotoHydrated(page, '/settings');
		expect((await box(page.locator('.settings'))).width).toBe(FORM_CAP);
	});

	test(
		'the comic side column is 22rem and the main column takes the rest',
		{ tag: '@REQ-330-3' },
		async ({ page }) => {
			const comicId = await createComic(page);
			await gotoHydrated(page, `/comic/${comicId}`);
			const [first, side] = await page.locator('.overview > .column').all();
			const overview = await box(page.locator('.overview'));
			expect((await box(side)).width).toBe(22 * REM);
			expect((await box(first)).width).toBeGreaterThan(overview.width - 22 * REM - 3 * REM);
		},
	);

	test('the panel image column stays 20rem wide', { tag: '@REQ-330-3' }, async ({ page }) => {
		test.slow();
		// Portrait only: a "Portrait and landscape" comic shows two images side by side, not one column.
		const { comicId, panelId } = await createComicWithFormat(page, 'portrait');
		await generatePanelImage(page, comicId, panelId);
		const pictures = page.locator('.pictures');
		await expect(pictures).toBeVisible();
		expect((await box(pictures)).width).toBe(20 * REM);
	});
});

test.describe('wide container at 1280 px', () => {
	test.use({ viewport: { width: 1280, height: 800 } });

	test('landing main fills the window', { tag: '@REQ-330-1' }, async ({ page }) => {
		await gotoHydrated(page, '/');
		expect((await box(page.locator('main'))).width).toBe(1280);
	});
});
