import { m } from '$lib/paraglide/messages';
import { expect, type Locator, type Page } from '@playwright/test';
import { activate, typeInto } from './keyboard';

/** Mock markers that make the gateway return an unusable response (`docs/rules/testing.md`). */
export const NO_IMAGE = 'mock-error:no-image';
export const NO_IMAGE_ONCE = 'mock-error:no-image-once';
export const INVALID_TEXT = 'mock-error:invalid-text';

const TECHNICAL_MESSAGE = /Invalid AI response/;

export const errorRegion = (page: Page) => page.getByTestId('error-test-id');

/** Replace the form's instructions (empty clears them) and press its submit button. */
export async function submitWithInstructions(page: Page, button: Locator, instructions: string) {
	await typeInto(page, page.getByRole('textbox', { name: m.instructions() }), instructions);
	await activate(page, button);
}

/**
 * The error region shows `message`, none of the raw provider output is visible
 * (REQ-009), and the technical message is collapsed behind "Show details".
 */
export async function expectFriendlyAiError(page: Page, message: string) {
	const error = errorRegion(page);
	await expect(error).toContainText(message);
	// innerText: the collapsed technical message is in the DOM but not rendered.
	for (const raw of ['[', '{', 'invalid_type', 'Internal Error']) {
		await expect(error).not.toContainText(raw, { useInnerText: true });
	}
	await expect(error.getByText(m.showDetails(), { exact: true })).toBeVisible();
	await expect(error.getByText(TECHNICAL_MESSAGE)).toBeHidden();
}

/** Tab to "Show details" and open it; the technical message becomes visible. */
export async function openDetails(page: Page) {
	const error = errorRegion(page);
	await activate(page, error.getByText(m.showDetails(), { exact: true }));
	await expect(error.getByText(TECHNICAL_MESSAGE)).toBeVisible();
}
