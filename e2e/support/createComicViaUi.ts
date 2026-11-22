import { expect, type Page } from '@playwright/test';
import { goto } from './goto';
import { activate, typeInto } from './keyboard';
import { m } from './messages';

/** Create a comic through the UI (mock AI), as a user does, and return its id. */
export async function createComicViaUi(
	page: Page,
	url = 'https://example.com/article',
): Promise<string> {
	await goto(page, '/comic/create');
	await typeInto(page, page.getByRole('textbox', { name: m.url() }), url);
	await activate(page, page.getByRole('button', { name: m.submit() }));
	await expect(page).toHaveURL(/\/comic\/[0-9a-f-]{36}$/);
	const id = page.url().split('/').at(-1);
	if (!id) {
		throw new Error('created comic has no id');
	}
	return id;
}
