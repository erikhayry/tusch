import { expect, type Page } from '@playwright/test';
import { gotoHydrated } from './gotoHydrated';

/**
 * Visit `url` online and wait until the service worker has installed (so the app shell
 * is cached), activated and controls the page. Going offline before this is a race:
 * the worker may still be fetching the build files, or not yet answer the reload.
 */
export async function visitWithServiceWorker(page: Page, url = '/'): Promise<void> {
	await gotoHydrated(page, url);
	// `ready` never resolves without a registration; poll first so a missing worker fails clearly.
	await expect
		.poll(() => page.evaluate(async () => !!(await navigator.serviceWorker.getRegistration())))
		.toBe(true);
	await page.evaluate(() => navigator.serviceWorker.ready);
	// A page is only controlled when it is loaded after the worker activated.
	await gotoHydrated(page, url);
	await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
}

/** The names of the caches the service worker has left on the origin. */
export function cacheNames(page: Page): Promise<string[]> {
	return page.evaluate(() => caches.keys());
}
