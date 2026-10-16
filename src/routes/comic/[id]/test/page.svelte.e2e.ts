import { expect, test } from '@playwright/test';
import { EXAMPLES } from '../../../../examples/examples';
import { ComicPage } from './utils/comicPage';

test('has expected title', async ({ page }) => {
	const comicPage = await new ComicPage(page, EXAMPLES[0]).goto();

	await expect(comicPage.heading).toBeVisible();
});

test('opens panel view', async ({ page }) => {
	const comicPage = await new ComicPage(page, EXAMPLES[0]).goto();

	await comicPage.link.click();

	await page.waitForURL(`**/comic/${EXAMPLES[0].id}/${EXAMPLES[0].panels[0].id}`);
});

test('delete cover', async ({ page }) => {
	const comicPage = await new ComicPage(page, EXAMPLES[0]).goto();

	await expect(comicPage.initialCoverImage).toBeVisible();

	await comicPage.deleteCoverButton.click();

	await expect(comicPage.initialCoverImage).not.toBeVisible();
});

test('create cover', async ({ page }) => {
	const comicPage = await new ComicPage(page, EXAMPLES[0]).goto();

	await comicPage.deleteCoverButton.click();
	await comicPage.addCoverButton.click();

	await expect(comicPage.newCoverImage).toBeVisible();
});

test('delete panel', async ({ page }) => {
	const comicPage = await new ComicPage(page, EXAMPLES[0]).goto();

	await expect(comicPage.listItems).toHaveCount(comicPage.initialNumberOfListItems);

	await comicPage.deletePanelButton.click();

	await expect(comicPage.listItems).toHaveCount(comicPage.initialNumberOfListItems - 1);
});
