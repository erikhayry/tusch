import { m } from '#lib/paraglide/messages.js';
import { expect, test } from '@playwright/test';
import { gotoHydrated } from '../../../../../tests/e2e/gotoHydrated';
import { activate, tabTo } from '../../../../../tests/e2e/keyboard';
import { storedComics } from '../../../../../tests/e2e/storage';
import { CreatePage } from './utils/createPage';

const NARROW = { width: 390, height: 844 };
const WIDE = { width: 1280, height: 800 };

test.describe('back link', { tag: '@REQ-296-1' }, () => {
	for (const viewport of [NARROW, WIDE]) {
		test(`sits before the heading and opens the library at ${viewport.width}px`, async ({
			page,
		}) => {
			await page.setViewportSize(viewport);
			const createPage = await new CreatePage(page).goto();
			const back = page.getByRole('main').getByRole('link', { name: m.backToComics() });

			await expect(back).toBeVisible();
			const backBox = await back.boundingBox();
			const headingBox = await createPage.heading.boundingBox();
			expect(backBox?.y).toBeLessThan(headingBox?.y ?? 0);

			await tabTo(page, back);
			await activate(page, back);

			await expect(page).toHaveURL(/\/$/);
		});
	}
});

test.describe('form footer', { tag: '@REQ-296-2' }, () => {
	test('Cancel opens the library and creates no comic', async ({ page }) => {
		const createPage = await new CreatePage(page).goto();
		const before = (await storedComics(page)).length;
		const cancel = page.locator('form').getByRole('link', { name: m.cancel() });

		await expect(cancel).toBeVisible();
		await tabTo(page, cancel);
		await activate(page, cancel);

		await expect(page).toHaveURL(/\/$/);
		expect((await storedComics(page)).length).toBe(before);
		await expect(createPage.heading).toBeHidden();
	});

	test('the Settings link in the footer opens settings', async ({ page }) => {
		await new CreatePage(page).goto();
		const form = page.locator('form');
		await expect(form.getByText(m.createComicNeedsKey())).toBeVisible();
		const settings = form.getByRole('link', { name: m.settings() });

		await expect(settings).toBeVisible();
		await tabTo(page, settings);
		await activate(page, settings);

		await expect(page).toHaveURL(/\/settings$/);
	});

	test('Tab order is URL, story, panels, style, then the footer', async ({ page }) => {
		const createPage = await new CreatePage(page).goto();
		const form = page.locator('form');
		const order = [
			createPage.urlInput,
			createPage.storyInput,
			createPage.panelCountInput,
			form.getByRole('combobox', { name: m.comicStyles() }),
			form.getByRole('link', { name: m.settings() }),
			form.getByRole('link', { name: m.cancel() }),
			createPage.submitButton,
		];

		await tabTo(page, order[0]);
		for (const control of order.slice(1)) {
			await page.keyboard.press('Tab');
			await expect(control).toBeFocused();
		}
	});

	test('"Create comic" is visible at 390px without scrolling', async ({ page }) => {
		await page.setViewportSize(NARROW);
		const createPage = await new CreatePage(page).goto();

		await expect(page.getByRole('main')).toBeVisible();
		expect(await page.evaluate(() => window.scrollY)).toBe(0);
		await expect(createPage.submitButton).toBeInViewport({ ratio: 1 });
	});
});

test(
	'the URL and story fields have their own helper text and say optional',
	{ tag: '@REQ-296-3' },
	async ({ page }) => {
		const createPage = await new CreatePage(page).goto();

		await expect(createPage.urlInput).toHaveAccessibleDescription(m.createComicUrlHint());
		await expect(createPage.storyInput).toHaveAccessibleDescription(m.createComicStoryHint());
		await expect(createPage.urlInput).toHaveAccessibleName(new RegExp(`${m.optional()}$`));
		await expect(createPage.storyInput).toHaveAccessibleName(new RegExp(`${m.optional()}$`));
	},
);

test('a created comic still opens from the new button', { tag: '@REQ-005' }, async ({ page }) => {
	await gotoHydrated(page, '/comic/create');
	const createPage = new CreatePage(page);

	await createPage.fillUrl('https://example.com/article');
	await createPage.submit();

	await expect(page).toHaveURL(/\/comic\/[0-9a-f-]{36}$/);
});
