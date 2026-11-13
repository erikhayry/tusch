import { expect, test, type Page } from '@playwright/test';
import { luminance } from './contrast';
import { gotoHydrated } from './gotoHydrated';
import { VIEWS } from './views';

/** The root's computed colours: what the whole page inherits. */
function rootColors(page: Page) {
	return page.evaluate(() => {
		const style = getComputedStyle(document.documentElement);
		return {
			background: style.backgroundColor,
			text: style.color,
			colorScheme: style.colorScheme,
		};
	});
}

test.describe('dark colour scheme', { tag: '@REQ-044' }, () => {
	test.use({ colorScheme: 'dark' });

	for (const [name, url] of Object.entries(VIEWS)) {
		test(`${name} has light text on a dark background`, async ({ page }) => {
			await gotoHydrated(page, url);
			const { background, text } = await rootColors(page);
			expect(luminance(background)).toBeLessThan(luminance(text));
		});

		test(`${name} renders native controls dark`, async ({ page }) => {
			await gotoHydrated(page, url);
			const { colorScheme } = await rootColors(page);
			expect(colorScheme).toContain('dark');
		});
	}
});

test.describe('light colour scheme', { tag: '@REQ-044' }, () => {
	test.use({ colorScheme: 'light' });

	for (const [name, url] of Object.entries(VIEWS)) {
		test(`${name} is black on white`, async ({ page }) => {
			await gotoHydrated(page, url);
			const { background, text } = await rootColors(page);
			expect(background).toBe('rgb(255, 255, 255)');
			expect(text).toBe('rgb(0, 0, 0)');
		});
	}
});

test('the colour scheme updates without a reload', { tag: '@REQ-044' }, async ({ page }) => {
	await page.emulateMedia({ colorScheme: 'light' });
	await gotoHydrated(page, VIEWS.landing);
	const light = await rootColors(page);
	expect(light.background).toBe('rgb(255, 255, 255)');

	await page.emulateMedia({ colorScheme: 'dark' });
	await expect
		.poll(async () => luminance((await rootColors(page)).background))
		.toBeLessThan(luminance(light.background));
	const dark = await rootColors(page);
	expect(luminance(dark.background)).toBeLessThan(luminance(dark.text));
});
