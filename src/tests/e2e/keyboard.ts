import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';

/** Enough for the busiest view; a bound turns an unreachable control into a clear failure. */
const MAX_TABS = 80;

/** Describe the focused element for failure messages. */
function describeFocused(page: Page): Promise<string> {
	return page.evaluate(() => {
		const el = document.activeElement;
		if (!el || el === document.body) return 'nothing (document body)';
		const label = el.getAttribute('aria-label') ?? el.textContent?.trim().slice(0, 40) ?? '';
		return `<${el.tagName.toLowerCase()}> "${label}"`;
	});
}

/**
 * Move focus to `target` the way a keyboard user does: press Tab (from wherever
 * focus is now) until the target is focused. Fails, naming the focused element,
 * if the target can't be reached within a bounded number of presses.
 */
export async function tabTo(page: Page, target: Locator, maxTabs = MAX_TABS): Promise<void> {
	for (let presses = 0; presses <= maxTabs; presses++) {
		if (await target.evaluate((el) => el === document.activeElement).catch(() => false)) {
			await expect(target).toBeFocused();
			return;
		}
		if (presses < maxTabs) await page.keyboard.press('Tab');
	}
	throw new Error(
		`Could not reach ${target} with Tab in ${maxTabs} presses; focus ended on ${await describeFocused(page)}`,
	);
}

/** Tab to a control and press Enter (links, buttons) or Space. */
export async function activate(
	page: Page,
	target: Locator,
	key: 'Enter' | 'Space' = 'Enter',
): Promise<void> {
	await tabTo(page, target);
	await page.keyboard.press(key);
}

/** Tab to a text field, replace its content and type `text`. */
export async function typeInto(page: Page, target: Locator, text: string): Promise<void> {
	await tabTo(page, target);
	await page.keyboard.press('ControlOrMeta+A');
	if (text === '') await page.keyboard.press('Delete');
	else await page.keyboard.type(text);
}

/** Tab to a <select> and choose an option by typing its label (type-ahead). */
export async function chooseOption(page: Page, target: Locator, label: string): Promise<void> {
	await tabTo(page, target);
	await page.keyboard.type(label);
}

/** Every focusable control currently in the document, in DOM-visible order. */
export function focusableControls(page: Page): Locator {
	return page.locator(
		'a[href], button:not([disabled]), input:not([type="hidden"]):not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
	);
}
