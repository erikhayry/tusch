import type { Page } from '@playwright/test';

/**
 * Keep requests matching `url` open until `release()` is called, then let them
 * through unchanged. Releasing from the test (not a timeout) keeps the
 * "still running" state deterministic; the page clock can't affect Node timers.
 */
export async function holdRequest(page: Page, url: RegExp | string): Promise<() => void> {
	let release: () => void = () => {};
	const released = new Promise<void>((resolve) => {
		release = resolve;
	});
	await page.route(url, async (route) => {
		await released;
		await route.continue();
	});
	return release;
}
