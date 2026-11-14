import { m } from '$lib/paraglide/messages';
import { ComicSchema, type Comic } from '$lib/types';
import { expect, type Page } from '@playwright/test';
import { gotoHydrated } from './gotoHydrated';
import { activate, typeInto } from './keyboard';

export type CharacterImage = Comic['characters'][number]['images'][number];

/** Create a comic through the UI (mock AI), as a user does, and return its id. */
export async function createComic(page: Page): Promise<string> {
	await gotoHydrated(page, '/comic/create');
	await typeInto(page, page.getByRole('textbox', { name: /url/i }), 'https://example.com/article');
	await activate(page, page.getByRole('button', { name: /submit/i }));
	await expect(page).toHaveURL(/\/comic\/[0-9a-f-]{36}$/);
	const id = page.url().split('/').at(-1);
	if (!id) throw new Error('created comic has no id');
	return id;
}

/** Create a comic through the UI and open its first panel, which has no image yet. */
export async function createComicAtFirstPanel(page: Page) {
	const comicId = await createComic(page);
	const panel = (await storedComic(page, comicId)).panels[0];
	if (!panel) throw new Error('created comic has no panel');
	await gotoHydrated(page, `/comic/${comicId}/${panel.id}`);
	return { comicId, panelId: panel.id };
}

/** The comic as persisted in `localStorage`, validated. */
export async function storedComic(page: Page, comicId: string): Promise<Comic> {
	const stored = await page.evaluate((id) => {
		const { comics } = JSON.parse(localStorage.getItem('comics_db') ?? '{"comics":[]}');
		return comics.find((comic: { id: string }) => comic.id === id);
	}, comicId);
	return ComicSchema.parse(stored);
}

export function imagesFromPanel(comic: Comic, panelId: string): CharacterImage[] {
	return comic.characters.flatMap((character) =>
		character.images.filter((image) => image.panelId === panelId),
	);
}

export async function deletePanel(page: Page, comicId: string, number: number) {
	await gotoHydrated(page, `/comic/${comicId}`);
	const panels = page.locator('ul[aria-labelledby="panels"] > li');
	const before = await panels.count();
	await activate(page, page.getByRole('button', { name: m.deletePanel({ number }) }));
	await expect(panels).toHaveCount(before - 1);
}

/** Generate the panel's image through the UI; the mock returns crops for the comic's characters. */
export async function generatePanelImage(page: Page, comicId: string, panelId: string) {
	await gotoHydrated(page, `/comic/${comicId}/${panelId}`);
	await activate(page, page.getByRole('button', { name: m.addImage() }));
	await expect(page.getByRole('img', { name: 'mock alt text' })).toBeVisible();
	await expect
		.poll(async () => imagesFromPanel(await storedComic(page, comicId), panelId))
		.not.toEqual([]);
}
