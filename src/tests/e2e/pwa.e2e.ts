import { m } from '#lib/paraglide/messages.js';
import { expect, test } from '@playwright/test';
import { createViewableComic } from '../../routes/(local)/comic/[id]/view/test/utils/viewableComic';
import { LandingPage } from '../../routes/(local)/test/utils/landingPage';
import { exampleTitles } from './examples';
import { errorRegion } from './aiFailures';
import { storedComic } from './createdComic';
import { gotoHydrated } from './gotoHydrated';
import { activate } from './keyboard';
import { cacheNames, visitWithServiceWorker } from './serviceWorker';
import { VIEWS } from './views';

// The worker installs by fetching the whole build, then every test reloads: give it room.
test.beforeEach(() => {
	test.slow();
});

test.describe('the app is installable', { tag: '@REQ-93-1' }, () => {
	for (const [name, url] of Object.entries(VIEWS)) {
		test(`${name} links the manifest`, async ({ page }) => {
			await gotoHydrated(page, url);
			await expect(page.locator('link[rel="manifest"]')).toHaveCount(1);
			await expect(page.locator('link[rel="manifest"]')).toHaveAttribute('href', /.+/);
			await expect(page.locator('meta[name="theme-color"]')).toHaveCount(1);
		});
	}

	test('the manifest names the app and every icon is an image', async ({ page }) => {
		await gotoHydrated(page, '/');
		const href = await page.locator('link[rel="manifest"]').getAttribute('href');
		expect(href).toBeTruthy();
		const response = await page.request.get(new URL(href ?? '', page.url()).href);
		expect(response.ok()).toBe(true);
		const manifest = await response.json();

		expect(manifest).toMatchObject({
			name: 'Tusch',
			short_name: 'Tusch',
			display: 'standalone',
			start_url: '/',
		});
		const colour = /^#[0-9a-f]{3,8}$/i;
		expect(manifest.theme_color).toMatch(colour);
		expect(manifest.background_color).toMatch(colour);

		const icons: { src: string; sizes?: string; type?: string; purpose?: string }[] =
			manifest.icons;
		const has = (match: (icon: (typeof icons)[number]) => boolean) => icons.some(match);
		expect(has((i) => i.sizes === '192x192' && i.type === 'image/png')).toBe(true);
		expect(has((i) => i.sizes === '512x512' && i.type === 'image/png')).toBe(true);
		expect(has((i) => i.type === 'image/png' && !!i.purpose?.includes('maskable'))).toBe(true);
		expect(has((i) => i.type === 'image/svg+xml')).toBe(true);

		for (const icon of icons) {
			const image = await page.request.get(new URL(icon.src, response.url()).href);
			expect(image.ok(), icon.src).toBe(true);
			expect(image.headers()['content-type'], icon.src).toMatch(/^image\//);
		}
	});
});

test.describe('the app opens offline', { tag: '@REQ-93-2' }, () => {
	test('the comic list with the examples shows after one online visit', async ({
		page,
		context,
	}) => {
		await visitWithServiceWorker(page);
		await context.setOffline(true);
		await page.reload();
		await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });

		// A comic's title is not a heading on the list; the shared card locator finds it.
		const landingPage = new LandingPage(page);
		for (const title of exampleTitles()) {
			await expect(landingPage.card(title)).toBeVisible();
		}
	});

	test('a created comic opens as comic, panel and viewer', async ({ page, context }) => {
		const comic = await createViewableComic(page);
		const [firstPanel] = comic.panels;
		await visitWithServiceWorker(page);
		await context.setOffline(true);

		await gotoHydrated(page, `/comic/${comic.id}`);
		await expect(
			page.getByRole('heading', { name: comic.title, level: 1, exact: true }),
		).toBeVisible();

		await gotoHydrated(page, `/comic/${comic.id}/${firstPanel.id}`);
		await expect(page.getByRole('img', { name: 'mock alt text' }).first()).toBeVisible();

		await gotoHydrated(page, `/comic/${comic.id}/view`);
		await expect(page.getByRole('heading', { name: comic.title, level: 1 })).toBeVisible();
		await expect(page.getByRole('main').getByRole('img').first()).toBeVisible();
	});
});

test.describe('the worker leaves other requests alone', { tag: '@REQ-93-3' }, () => {
	test('an AI action offline shows the error and keeps the comic', async ({ page, context }) => {
		const comic = await createViewableComic(page);
		const panelId = comic.panels[0].id;
		await visitWithServiceWorker(page, `/comic/${comic.id}/${panelId}`);
		const before = await storedComic(page, comic.id);
		await context.setOffline(true);

		await activate(page, page.getByRole('button', { name: m.generateNewImage(), exact: true }));

		await expect(errorRegion(page)).toContainText(m.error());
		expect(await storedComic(page, comic.id)).toEqual(before);
	});

	test('a mocked form post is answered by the mock, not the worker', async ({ page }) => {
		const comic = await createViewableComic(page);
		await visitWithServiceWorker(page, `/comic/${comic.id}/${comic.panels[0].id}`);
		await page.route(/\?\/create-panel-image/, (route) =>
			route.fulfill({
				status: 500,
				contentType: 'application/json',
				body: JSON.stringify({ type: 'error', error: { message: 'mocked by the test' } }),
			}),
		);

		await activate(page, page.getByRole('button', { name: m.generateNewImage(), exact: true }));

		await expect(errorRegion(page)).toContainText('mocked by the test');
	});

	test('a mocked page navigation is answered by the mock', async ({ page }) => {
		await visitWithServiceWorker(page);
		await page.route(/\/settings$/, (route) =>
			route.fulfill({ contentType: 'text/html', body: '<h1>mocked settings</h1>' }),
		);

		await page.goto('/settings');

		await expect(page.getByRole('heading', { name: 'mocked settings' })).toBeVisible();
	});
});

test.describe('a new worker replaces the old caches', { tag: '@REQ-93-4' }, () => {
	test('only one cache is left, and an older version cache is deleted', async ({ page }) => {
		// A static file has no worker, so the old cache is in place before the worker installs.
		await page.goto('/robots.txt');
		await page.evaluate(() => caches.open('old-version-cache'));
		expect(await cacheNames(page)).toEqual(['old-version-cache']);

		await visitWithServiceWorker(page);

		await expect.poll(() => cacheNames(page)).toHaveLength(1);
		expect(await cacheNames(page)).not.toContain('old-version-cache');
	});
});
