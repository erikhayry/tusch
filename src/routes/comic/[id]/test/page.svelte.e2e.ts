import { ComicsMock } from '$lib/types/test/utils/mockTypes';
import { expect, test } from '@playwright/test';
import { ComicPage } from './utils/comicPage';

test.beforeEach(async ({ request }) => {
	await request.post('/api/test/seed');
});

test('has expected title', async ({ page }) => {
	const comicPage = await new ComicPage(page, ComicsMock[0]).goto();

	await expect(comicPage.heading).toBeVisible();
});

test('opens panel view', async ({ page }) => {
	const comicPage = await new ComicPage(page, ComicsMock[0]).goto();

	await comicPage.link.click();

	await page.waitForURL(`**/comic/${ComicsMock[0].id}/${ComicsMock[0].panels[0].id}`);
});

test('delete panel', async ({ page }) => {
	const comicPage = await new ComicPage(page, ComicsMock[0]).goto();

	await expect(comicPage.listItems).toHaveCount(comicPage.initialNumberOfListItems);

	await comicPage.deletePanelButton.click();

	await expect(comicPage.listItems).toHaveCount(comicPage.initialNumberOfListItems - 1);
});
