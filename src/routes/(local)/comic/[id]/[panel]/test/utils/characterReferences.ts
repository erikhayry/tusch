import { CREATE_PANEL_IMAGE_ACTION } from '#lib/features/panels/contracts/createPanelImage.ts';
import { m } from '#lib/paraglide/messages.js';
import type { Comic } from '#lib/types/index.ts';
import { expect, type Locator, type Page } from '@playwright/test';
import {
	createComic,
	generatePanelImage,
	imagesFromPanel,
	storedComic,
	type CharacterImage,
} from '../../../../../../../tests/e2e/createdComic';
import { gotoHydrated } from '../../../../../../../tests/e2e/gotoHydrated';
import { activate } from '../../../../../../../tests/e2e/keyboard';
import { storedFileBase64 } from '../../../../../../../tests/e2e/storage';

function escapeRegExp(text: string) {
	return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * A character's reference toggles (REQ-323-4): buttons named "<character> from panel <n>" with
 * `aria-pressed`. Without a character, every reference toggle on the page.
 */
export function referenceOptions(page: Page, characterName?: string): Locator {
	const MARKER = '\u0001';
	const [before, between] = m
		.characterReferenceOption({ character: MARKER, number: 0 })
		.split(MARKER);
	const prefix =
		characterName === undefined
			? `${escapeRegExp(before)}.+`
			: escapeRegExp(before + characterName);
	const suffix = escapeRegExp(between.replace(/0$/, ''));
	return page.getByRole('button', { name: new RegExp(`^${prefix}${suffix}\\d+$`) });
}

/** The toggle that picks the crop taken from panel `number` (1-based). */
export function referenceOption(page: Page, characterName: string, number: number): Locator {
	return page.getByRole('button', {
		name: m.characterReferenceOption({ character: characterName, number }),
		exact: true,
	});
}

/** Press a reference toggle by keyboard. */
export async function chooseReference(
	page: Page,
	characterName: string,
	number: number,
	pressed = true,
) {
	const target = referenceOption(page, characterName, number);
	await activate(page, target);
	await expect(target).toHaveAttribute('aria-pressed', String(pressed));
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
	if (!a || !b) {
		throw new Error('created comic needs two panels');
	}
	await generatePanelImage(page, comicId, a.id);
	const comic = await storedComic(page, comicId);
	const shared = speakers(comic, a.id).find(({ id }) =>
		speakers(comic, b.id).some((speaker) => speaker.id === id),
	);
	const silentInB = comic.characters.find(
		({ id }) => !speakers(comic, b.id).some((speaker) => speaker.id === id),
	);
	if (!shared || !silentInB) {
		throw new Error('mock comic needs a shared and a non-speaking character');
	}
	return { comicId, comic, a, b, shared, silentInB, imagesOfA: imagesFromPanel(comic, a.id) };
}
