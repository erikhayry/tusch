import { m } from '$lib/paraglide/messages';
import { expect, test, type Page } from '@playwright/test';
import { gotoHydrated } from './gotoHydrated';
import { typeInto } from './keyboard';
import { VIEWS } from './views';

/**
 * Visual baselines for every view (docs/rules/testing.md, "Screenshots").
 * Baselines are Linux-only and are generated and compared in CI inside the
 * Playwright container. Locally they are skipped unless PLAYWRIGHT_SCREENSHOTS=1.
 */
test.skip(
	process.env.PLAYWRIGHT_SCREENSHOTS !== '1',
	'Screenshots run in CI (Linux container); see pnpm screenshots:update',
);

async function settle(page: Page) {
	// Lazy images only start loading once scrolled near the viewport, and a
	// full-page screenshot doesn't scroll, so reveal each one first.
	await page.evaluate(() => {
		for (const image of document.images) image.scrollIntoView();
		window.scrollTo(0, 0);
	});
	await page.waitForLoadState('networkidle');
	// Wait for every <img> to finish loading (or fail to the placeholder).
	await page.evaluate(() =>
		Promise.all(
			Array.from(document.images).map((image) =>
				image.complete && (image.naturalWidth > 0 || !image.currentSrc)
					? null
					: new Promise((done) => (image.onload = image.onerror = done)),
			),
		),
	);
	// decoding="async" images can still be unpainted once loaded; a full-page
	// shot taken before the decode finishes shows them blank.
	await page.evaluate(() =>
		Promise.all(Array.from(document.images).map((image) => image.decode().catch(() => null))),
	);
}

async function snapshot(page: Page, url: string, name: string) {
	await gotoHydrated(page, url);
	await settle(page);
	await expect(page).toHaveScreenshot(`${name}.png`, { fullPage: true });
}

test.describe('screenshots', () => {
	for (const [name, url] of Object.entries(VIEWS)) {
		test(name, async ({ page }) => {
			await snapshot(page, url, name);
		});
	}

	test.describe('dark colour scheme', () => {
		test.use({ colorScheme: 'dark' });
		// Only these three views get dark baselines; axe scans all of them in dark.
		for (const name of ['landing', 'comic', 'settings'] as const) {
			test(name, async ({ page }) => {
				await gotoHydrated(page, VIEWS[name]);
				await settle(page);
				await expect(page).toHaveScreenshot(`${name}-dark.png`, { fullPage: true });
			});
		}
	});

	test('settings after adding a key', async ({ page }) => {
		await gotoHydrated(page, '/settings');
		await typeInto(page, page.getByRole('textbox', { name: m.byok() }), 'mock key');
		await page.keyboard.press('Enter');
		await expect(page.getByText(m.keyAdded())).toBeVisible();
		await settle(page);
		await expect(page).toHaveScreenshot('settings-key-added.png', { fullPage: true });
	});
});
