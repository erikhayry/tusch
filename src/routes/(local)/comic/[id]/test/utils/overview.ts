import { m } from '#lib/paraglide/messages.js';
import type { Comic } from '#lib/types/index.ts';
import { primaryVariant } from '#lib/types/image-variants.ts';
import type { Locator, Page } from '@playwright/test';

/** The comic page's four cards, as their `<h2>`s, in order (REQ-236-2). */
export const CARD_HEADINGS = () => [m.panels(), m.characters(), m.cover(), m.comicSettings()];

const plural = (count: number, one: () => string, many: (params: { count: number }) => string) =>
	count === 1 ? one() : many({ count });

export const panelCountLabel = (count: number) => plural(count, m.panelCountOne, m.panelCount);
const characterCountLabel = (count: number) => plural(count, m.characterCountOne, m.characterCount);
const captionCountLabel = (count: number) => plural(count, m.captionCountOne, m.captionCount);
const lineCountLabel = (count: number) => plural(count, m.lineCountOne, m.lineCount);
export const appearsInLabel = (count: number) => plural(count, m.appearsInOne, m.appearsIn);

/** The comic's meta line: "8 panels · 2 characters", or "1 panel" without characters (REQ-297-1). */
export function comicMeta(comic: Comic): string {
	return [
		panelCountLabel(comic.panels.length),
		comic.characters.length ? characterCountLabel(comic.characters.length) : null,
	]
		.filter((part) => part !== null)
		.join(' · ');
}

/** A panel card's meta line; empty when the panel has no captions and no lines (REQ-297-2). */
export function panelMeta({ captions, dialogue }: Comic['panels'][number]): string {
	return [
		captions.length ? captionCountLabel(captions.length) : null,
		dialogue.length ? lineCountLabel(dialogue.length) : null,
	]
		.filter((part) => part !== null)
		.join(' · ');
}

const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// Any caption or line count, whatever the number (7 stands in for it, then becomes `\d+`).
const anyCount = (one: () => string, many: (params: { count: number }) => string) =>
	`${escape(one())}|${escape(many({ count: 7 })).replace('7', '\\d+')}`;
/** Matches the text of any panel meta part, for asserting a card has none. */
export const ANY_PANEL_META = () =>
	new RegExp(
		`${anyCount(m.captionCountOne, m.captionCount)}|${anyCount(m.lineCountOne, m.lineCount)}`,
	);

/** How many panels list the character (REQ-014): those whose current image has a position for it. */
export function panelsListedFor(comic: Comic, characterId: string): number {
	return comic.panels.filter(({ image }) =>
		primaryVariant(image)?.asset.characters?.some(({ id }) => id === characterId),
	).length;
}

/** The text of the nearest `<h2>` before the element: the card it sits in. */
export function owningCard(element: Locator): Promise<string | null | undefined> {
	return element.evaluate((el) => {
		const before = [...document.querySelectorAll('h2')].filter(
			(heading) => heading.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING,
		);
		return before.at(-1)?.textContent?.trim();
	});
}

/** Whether `first` comes before `second` in the document. */
export async function precedes(first: Locator, second: Locator): Promise<boolean> {
	const other = await second.elementHandle();
	return first.evaluate(
		(el, node) =>
			Boolean(node && el.compareDocumentPosition(node) & Node.DOCUMENT_POSITION_FOLLOWING),
		other,
	);
}

/** The panel strip: the list of panel cards. */
export const panelStrip = (page: Page) => page.getByRole('list', { name: m.panels(), exact: true });

/** Make a created comic's characters disappear, as a story with none would have (REQ-297-1). */
export async function removeStoredCharacters(page: Page, comicId: string) {
	await page.evaluate((id) => {
		const db = JSON.parse(localStorage.getItem('comics_db') ?? '{"comics":[]}');
		const comic = db.comics.find((candidate: { id: string }) => candidate.id === id);
		comic.characters = [];
		localStorage.setItem('comics_db', JSON.stringify(db));
	}, comicId);
}
