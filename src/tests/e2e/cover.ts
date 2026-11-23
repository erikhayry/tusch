import { m } from '#lib/paraglide/messages.js';
import { type Page } from '@playwright/test';
import { activate } from './keyboard';

/**
 * Removes the whole cover of a created comic, which has both variants (REQ-280-1). With
 * two variants the page offers "Remove … cover" per variant and no "Delete Cover", so the
 * landscape variant goes first and the remaining cover is deleted.
 */
export async function deleteCover(page: Page) {
	await activate(page, page.getByRole('button', { name: m.removeLandscapeCover(), exact: true }));
	await activate(page, page.getByRole('button', { name: m.deleteCover(), exact: true }));
}
