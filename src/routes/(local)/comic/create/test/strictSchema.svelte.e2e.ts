import { m } from '#lib/paraglide/messages.js';
import { expect, test } from '@playwright/test';
import {
	createComic,
	generatePanelImage,
	storedComic,
} from '../../../../../tests/e2e/createdComic';
import { gotoHydrated } from '../../../../../tests/e2e/gotoHydrated';
import { activate } from '../../../../../tests/e2e/keyboard';

// The mock gateway builds the text format like the real one, so a schema OpenAI's
// strict mode rejects fails these requests (#349).
test.describe('text requests use a schema strict mode accepts', () => {
	test(
		'creating a comic opens it with title, characters and panels',
		{ tag: ['@REQ-005', '@REQ-349-1'] },
		async ({ page }) => {
			const comicId = await createComic(page);

			const comic = await storedComic(page, comicId);
			expect(comic.title).not.toBe('');
			expect(comic.characters.length).toBeGreaterThan(0);
			expect(comic.panels.length).toBeGreaterThan(0);
			await expect(page.getByRole('heading', { level: 1 })).toHaveText(comic.title);
		},
	);

	test(
		'inserting a panel into a created comic shows the new panel',
		{ tag: '@REQ-349-1' },
		async ({ page }) => {
			const comicId = await createComic(page);
			const { panels } = await storedComic(page, comicId);
			await gotoHydrated(page, `/comic/${comicId}/${panels[0].id}`);

			await activate(page, page.getByRole('button', { name: m.addPanelAfter({ number: 1 }) }));

			await expect
				.poll(async () => (await storedComic(page, comicId)).panels.length)
				.toBe(panels.length + 1);
		},
	);

	test(
		'fixing a character crop on a created comic shows the fixed crop and offers Undo',
		{ tag: ['@REQ-349-1', '@REQ-219-2'] },
		async ({ page }) => {
			const comicId = await createComic(page);
			const { panels, characters } = await storedComic(page, comicId);
			await generatePanelImage(page, comicId, panels[0].id);
			await gotoHydrated(page, `/comic/${comicId}`);
			const name = characters[0].name;
			const section = page
				.locator('ul[aria-labelledby="characters"] > li')
				.filter({ has: page.getByRole('heading', { name, exact: true }) });
			const params = { name, number: 1, title: panels[0].editorialTitle };
			await activate(page, section.getByLabel(m.characterHeadAlt(params), { exact: true }));

			await activate(page, section.getByRole('button', { name: m.fixCharacterCrop(params) }));

			await expect(
				section.getByRole('button', { name: m.undoCharacterCropFix(params) }),
			).toBeVisible();
		},
	);
});
