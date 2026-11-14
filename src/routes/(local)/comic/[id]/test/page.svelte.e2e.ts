import { expect, test } from '@playwright/test';
import { gotoHydrated } from '../../../../../tests/e2e/gotoHydrated';
import { activate } from '../../../../../tests/e2e/keyboard';
import { EXAMPLE_COMPLETE } from '../../../../../tests/e2e/examples';
import { ComicPage } from './utils/comicPage';

test('has expected title', { tag: '@REQ-010' }, async ({ page }) => {
	const comicPage = await new ComicPage(page, EXAMPLE_COMPLETE).goto();

	await expect(comicPage.heading).toBeVisible();
});

test('opens panel view', { tag: '@REQ-010' }, async ({ page }) => {
	const comicPage = await new ComicPage(page, EXAMPLE_COMPLETE).goto();

	await activate(page, comicPage.link);

	await page.waitForURL(`**/comic/${EXAMPLE_COMPLETE.id}/${EXAMPLE_COMPLETE.panels[0].id}`);
});

test('delete cover', { tag: '@REQ-012' }, async ({ page }) => {
	const comicPage = await new ComicPage(page, EXAMPLE_COMPLETE).goto();

	await expect(comicPage.initialCoverImage).toBeVisible();

	await activate(page, comicPage.deleteCoverButton);

	await expect(comicPage.initialCoverImage).not.toBeVisible();
});

test('create cover', { tag: '@REQ-011' }, async ({ page }) => {
	const comicPage = await new ComicPage(page, EXAMPLE_COMPLETE).goto();

	await activate(page, comicPage.deleteCoverButton);
	await activate(page, comicPage.addCoverButton);

	await expect(comicPage.newCoverImage).toBeVisible();
});

test('delete panel', { tag: '@REQ-013' }, async ({ page }) => {
	const comicPage = await new ComicPage(page, EXAMPLE_COMPLETE).goto();

	await expect(comicPage.listItems).toHaveCount(comicPage.initialNumberOfListItems);

	await activate(page, comicPage.deletePanelButton);

	await expect(comicPage.listItems).toHaveCount(comicPage.initialNumberOfListItems - 1);
});

test('shows the stored comic as JSON in the raw view', { tag: '@REQ-027' }, async ({ page }) => {
	await gotoHydrated(page, `/comic/${EXAMPLE_COMPLETE.id}/raw`);

	const raw = await page.getByRole('textbox').inputValue();
	expect(JSON.parse(raw)).toMatchObject({ id: EXAMPLE_COMPLETE.id, title: EXAMPLE_COMPLETE.title });
});
