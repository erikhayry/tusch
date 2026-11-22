import type { Page } from '@playwright/test';

/**
 * The readiness contract between this suite and the app: the app sets the
 * `data-hydrated` attribute on <html> once it is interactive (event handlers
 * attached). Whatever framework renders the app, including Foldkit, must set it.
 * Interacting earlier can turn a form submit into a native POST. The suite waits
 * on nothing else framework-specific.
 */
export const READY_SELECTOR = 'html[data-hydrated]';

/** Navigate with a full page load and wait until the app is interactive. */
export async function goto(page: Page, url: string): Promise<void> {
	await page.goto(url);
	await page.locator(READY_SELECTOR).waitFor({ state: 'attached' });
}

/** Reload and wait for readiness again: a bare `page.reload()` returns before the app is interactive. */
export async function reload(page: Page): Promise<void> {
	await page.reload();
	await page.locator(READY_SELECTOR).waitFor({ state: 'attached' });
}
