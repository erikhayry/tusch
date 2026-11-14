import { CREATE_PANEL_IMAGE_ACTION } from '$lib/features/panels/contracts/createPanelImage';
import { m } from '$lib/paraglide/messages';
import type { Comic } from '$lib/types';
import { expect, type Locator, type Page } from '@playwright/test';
import {
	createComic,
	generatePanelImage,
	imagesFromPanel,
	storedComic,
	type CharacterImage,
} from '../../../../../../../tests/e2e/createdComic';
import { gotoHydrated } from '../../../../../../../tests/e2e/gotoHydrated';
import { activate, tabTo } from '../../../../../../../tests/e2e/keyboard';
import { storedFileBase64 } from '../../../../../../../tests/e2e/storage';

/** Radio that means "no reference"; its label is the "None" message. */
const NONE = { name: 'None', exact: true } as const;

/** The fieldset for one character's reference choice (its legend is the character's name). */
export function referenceGroup(page: Page, characterName: string): Locator {
	return page.getByRole('group', { name: characterName, exact: true });
}

/** The radio that picks the crop taken from panel `number` (1-based). */
export function referenceOption(group: Locator, number: number): Locator {
	return group.getByRole('radio', { name: m.panel({ number }) });
}

export function noneOption(group: Locator): Locator {
	return group.getByRole('radio', NONE);
}

/** Choose a panel's crop by keyboard: Tab to the checked radio, then arrow to the option. */
export async function chooseReference(page: Page, group: Locator, number: number) {
	const target = referenceOption(group, number);
	await tabTo(page, noneOption(group));
	for (let presses = 0; presses < 10 && !(await target.isChecked()); presses++) {
		await page.keyboard.press('ArrowDown');
	}
	await expect(target).toBeChecked();
}

/** Press `button` and return the body of the create-panel-image POST it sends. */
export async function submitAndCaptureBody(page: Page, button: Locator): Promise<string> {
	const request = page.waitForRequest(
		(candidate) =>
			candidate.method() === 'POST' && candidate.url().includes(`?/${CREATE_PANEL_IMAGE_ACTION}`),
	);
	await activate(page, button);
	return (await request).postData() ?? '';
}

export function panelUrl(comicId: string, panelId: string) {
	return `/comic/${comicId}/${panelId}`;
}

export async function gotoPanel(page: Page, comicId: string, panelId: string) {
	await gotoHydrated(page, panelUrl(comicId, panelId));
}

/** Characters that speak in the panel. */
export function speakers(comic: Comic, panelId: string) {
	const ids = comic.panels
		.find(({ id }) => id === panelId)
		?.dialogue.map(({ characterId }) => characterId);
	return comic.characters.filter(({ id }) => ids?.includes(id));
}

/** Crops of one character, as the bytes the form would send. */
export async function cropBytes(page: Page, image: CharacterImage) {
	return {
		head: await storedFileBase64(page, image.head.src),
		full: await storedFileBase64(page, image.full.src),
	};
}

/**
 * A comic made through the UI: panel 1 (A) has a generated image and so crops
 * of every character; panel 2 (B) has no image and shares a speaker with A.
 * The mock's second panel has two speakers and the third a character that
 * does not speak in B.
 */
export async function createComicWithImageOnFirstPanel(page: Page) {
	const comicId = await createComic(page);
	const { panels } = await storedComic(page, comicId);
	const [a, b] = panels;
	if (!a || !b) throw new Error('created comic needs two panels');
	await generatePanelImage(page, comicId, a.id);
	const comic = await storedComic(page, comicId);
	const shared = speakers(comic, a.id).find(({ id }) =>
		speakers(comic, b.id).some((speaker) => speaker.id === id),
	);
	const silentInB = comic.characters.find(
		({ id }) => !speakers(comic, b.id).some((speaker) => speaker.id === id),
	);
	if (!shared || !silentInB)
		throw new Error('mock comic needs a shared and a non-speaking character');
	return { comicId, comic, a, b, shared, silentInB, imagesOfA: imagesFromPanel(comic, a.id) };
}
