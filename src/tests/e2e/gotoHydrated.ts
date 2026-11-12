import type { Page } from '@playwright/test';

/**
 * Navigate with a full page load and wait until the app has hydrated (the root
 * layout sets `data-hydrated` on <html>). Interacting earlier can hit forms
 * before `use:enhance` is attached, turning a submit into a native POST.
 */
export async function gotoHydrated(page: Page, url: string): Promise<void> {
	await page.goto(url);
	await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });
}
