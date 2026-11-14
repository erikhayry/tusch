import { m } from '$lib/paraglide/messages';
import { expect, type Page } from '@playwright/test';
import { CreatePage as SettingsPage } from '../../routes/settings/test/utils/createPage';
import { gotoHydrated } from './gotoHydrated';
import { activate, typeInto } from './keyboard';

export const RATE_LIMIT_MESSAGE = 'AI provider rate limit reached, try again shortly';

/** Marker the mock gateway turns into a rate-limit error when it appears in any prompt. */
export const RATE_LIMIT_MARKER = 'mock-error:rate-limit';

/**
 * Create a comic through the UI, as a user does, and return its id and first panel id.
 * Do this before saving a failing marker as global instructions.
 */
export async function createComicThroughUi(
	page: Page,
): Promise<{ comicId: string; panelId: string }> {
	await gotoHydrated(page, '/comic/create');
	await typeInto(page, page.getByRole('textbox', { name: m.url() }), 'https://example.com/article');
	await activate(page, page.getByRole('button', { name: m.submit() }));
	await expect(page).toHaveURL(/\/comic\/[0-9a-f-]{36}$/);
	const comicId = page.url().split('/').at(-1) ?? '';
	const panelId = await page.evaluate((id) => {
		const { comics } = JSON.parse(localStorage.getItem('comics_db') ?? '{"comics":[]}');
		return comics.find((comic: { id: string }) => comic.id === id)?.panels[0]?.id ?? '';
	}, comicId);
	expect(panelId).not.toBe('');
	return { comicId, panelId };
}

/** Save global instructions on /settings through the UI. */
export async function saveGlobalInstructions(page: Page, text: string): Promise<void> {
	const settingsPage = await new SettingsPage(page).goto();
	await settingsPage.saveGlobalInstructions(text);
	await page.reload();
	await expect(settingsPage.globalInstructionsInput).toHaveValue(text);
}

/** Number of comics in local storage. */
export function storedComicCount(page: Page): Promise<number> {
	return page.evaluate(
		() => JSON.parse(localStorage.getItem('comics_db') ?? '{"comics":[]}').comics.length,
	);
}
