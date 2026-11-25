import { m } from '#lib/paraglide/messages.js';
import { expect, test } from '@playwright/test';
import { storedComics } from '../../../../../tests/e2e/storage';
import { CreatePage } from './utils/createPage';

const STORY = 'A lighthouse keeper finds a message in a bottle.\nIt leads her to a hidden cove.';
const COMIC_URL = /\/comic\/[0-9a-f-]{36}$/;
const PANELS = 'ul[aria-labelledby="panels"] > li';

test('shows the panel count field with 5 and a hint', { tag: '@REQ-289-1' }, async ({ page }) => {
	const createPage = await new CreatePage(page).goto();

	await expect(createPage.panelCountInput).toBeVisible();
	await expect(createPage.panelCountInput).toHaveValue('5');
	await expect(createPage.panelCountInput).toHaveAttribute('required', '');
	await expect(createPage.panelCountInput).toHaveAccessibleDescription(
		m.createComicPanelCountHint(),
	);
	// It sits after the story and before the comic style choice.
	const fields = page.locator(
		'form[action$="create-comic"] :is(input[name="url"], textarea, input[type="number"], input[type="radio"])',
	);
	await expect(fields).toHaveCount(7);
	for (const [index, name] of [
		'url',
		'story',
		'panelCount',
		'style',
		'style',
		'style',
		'style',
	].entries()) {
		await expect(fields.nth(index)).toHaveAttribute('name', name);
	}
});

test.describe('a created comic has the chosen number of panels', { tag: '@REQ-289-1' }, () => {
	for (const count of [undefined, '1', '30']) {
		test(`lists ${count ?? '5 (the default)'} panels`, async ({ page }) => {
			const createPage = await new CreatePage(page).goto();
			await createPage.pasteStory(STORY);
			if (count !== undefined) {
				await createPage.setPanelCount(count);
			}
			await createPage.submit();

			await expect(page).toHaveURL(COMIC_URL);
			await expect(page.locator(PANELS)).toHaveCount(Number(count ?? 5));
		});
	}
});

test.describe('an invalid panel count is rejected', { tag: '@REQ-289-2' }, () => {
	for (const count of ['0', '31', '2.5', '']) {
		test(`shows the panel-count message for "${count}" and creates nothing`, async ({ page }) => {
			const createPage = await new CreatePage(page).goto();
			const before = (await storedComics(page)).length;
			await createPage.pasteStory(STORY);
			await createPage.setPanelCount(count);
			await createPage.submitToServer();

			await expect(createPage.error).toContainText(m.createComicPanelCountError());
			await expect(page).toHaveURL(/\/comic\/create$/);
			expect((await storedComics(page)).length).toBe(before);
		});
	}

	test('clears the error and creates the comic once the count is valid', async ({ page }) => {
		const createPage = await new CreatePage(page).goto();
		await createPage.pasteStory(STORY);
		await createPage.setPanelCount('0');
		await createPage.submitToServer();
		await expect(createPage.error).toContainText(m.createComicPanelCountError());

		await createPage.setPanelCount('3');
		await createPage.submit();

		await expect(page).toHaveURL(COMIC_URL);
		await expect(page.locator(PANELS)).toHaveCount(3);
		await expect(createPage.error).toBeHidden();
	});
});
