import { m } from '#lib/paraglide/messages.js';
import { getImageFromOpenAiResponse } from '#lib/utils/ai/ai.ts';
import { expect, test, type Page } from '@playwright/test';
import {
	errorRegion,
	expectFriendlyAiError,
	NO_IMAGE,
	NO_IMAGE_ONCE,
	openDetails,
	submitWithInstructions,
} from '../../../../../tests/e2e/aiFailures';
import { deleteCover } from '../../../../../tests/e2e/cover';
import { createComic, storedComic } from '../../../../../tests/e2e/createdComic';
import { storedFiles } from '../../../../../tests/e2e/storage';
import { CREATE_COVER_IMAGE_RESPONSE } from '../../../../../tests/mock/openAi/openAiResponse';

const cover = (page: Page) =>
	page.getByRole('img', { name: getImageFromOpenAiResponse(CREATE_COVER_IMAGE_RESPONSE).alt });
const addCover = (page: Page) => page.getByRole('button', { name: m.addCover() });

/**
 * A comic created through the UI, with its cover deleted: the cover form is only
 * offered on a comic that has none.
 */
async function createComicWithoutCover(page: Page) {
	const comicId = await createComic(page);
	await deleteCover(page);
	await expect(cover(page)).toHaveCount(0);
	return comicId;
}

test(
	'retries once when the first cover response has no image',
	{ tag: ['@REQ-185-1', '@REQ-011'] },
	async ({ page }) => {
		await createComicWithoutCover(page);

		await submitWithInstructions(page, addCover(page), NO_IMAGE_ONCE);

		// Both variants: the portrait one needed the retry, and the landscape one is made as well.
		await expect(cover(page)).toHaveCount(2);
		await expect(errorRegion(page)).toBeEmpty();
	},
);

test(
	'shows a friendly message with details and saves no cover when no response has an image',
	{ tag: ['@REQ-185-2', '@REQ-011'] },
	async ({ page }) => {
		const comicId = await createComicWithoutCover(page);
		const url = page.url();
		const files = await storedFiles(page);

		await submitWithInstructions(page, addCover(page), NO_IMAGE);

		await expectFriendlyAiError(page, m.aiNoImage());
		await openDetails(page);
		await expect(cover(page)).toHaveCount(0);
		expect((await storedComic(page, comicId)).cover).toBeUndefined();
		expect(await storedFiles(page)).toEqual(files);
		expect(page.url()).toBe(url);
	},
);
