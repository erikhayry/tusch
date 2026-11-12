import { m } from '$lib/paraglide/messages';
import { expect, test, type Page } from '@playwright/test';
import { EXAMPLES } from '../../examples/examples';
import { gotoHydrated } from './gotoHydrated';

/**
 * Visual baselines for every view (docs/rules/testing.md, "Screenshots").
 * Baselines are Linux-only and are generated and compared in CI inside the
 * Playwright container. Locally they are skipped unless PLAYWRIGHT_SCREENSHOTS=1.
 */
test.skip(
	process.env.PLAYWRIGHT_SCREENSHOTS !== '1',
	'Screenshots run in CI (Linux container); see pnpm screenshots:update',
);

const EXAMPLE = EXAMPLES[0];
const MISSING_ID = '00000000-0000-4000-8000-000000000000';

async function settle(page: Page) {
	await page.waitForLoadState('networkidle');
	// Wait for every <img> to finish loading (or fail to the placeholder).
	await page.evaluate(() =>
		Promise.all(
			Array.from(document.images).map((image) =>
				image.complete ? null : new Promise((done) => (image.onload = image.onerror = done)),
			),
		),
	);
}

async function snapshot(page: Page, url: string, name: string) {
	await gotoHydrated(page, url);
	await settle(page);
	await expect(page).toHaveScreenshot(`${name}.png`, { fullPage: true });
}

test.describe('screenshots', () => {
	test('landing', async ({ page }) => {
		await snapshot(page, '/', 'landing');
	});

	test('create comic', async ({ page }) => {
		await snapshot(page, '/comic/create', 'create');
	});

	test('comic', async ({ page }) => {
		await snapshot(page, `/comic/${EXAMPLE.id}`, 'comic');
	});

	test('panel', async ({ page }) => {
		await snapshot(page, `/comic/${EXAMPLE.id}/${EXAMPLE.panels[0].id}`, 'panel');
	});

	test('raw comic', async ({ page }) => {
		await snapshot(page, `/comic/${EXAMPLE.id}/raw`, 'raw');
	});

	test('not found', async ({ page }) => {
		await snapshot(page, `/comic/${MISSING_ID}`, 'not-found');
	});

	test('settings', async ({ page }) => {
		await snapshot(page, '/settings', 'settings');
	});

	test('settings after adding a key', async ({ page }) => {
		await gotoHydrated(page, '/settings');
		await page.getByRole('textbox', { name: m.byok() }).fill('mock key');
		await page.getByRole('textbox', { name: m.byok() }).press('Enter');
		await expect(page.getByText(m.keyAdded())).toBeVisible();
		await settle(page);
		await expect(page).toHaveScreenshot('settings-key-added.png', { fullPage: true });
	});
});
