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

test('delete panel', async ({ page }) => {
	const comicPage = await new ComicPage(page, EXAMPLES[0]).goto();

	await expect(comicPage.listItems).toHaveCount(comicPage.initialNumberOfListItems);

	await comicPage.deletePanelButton.click();

	await expect(comicPage.listItems).toHaveCount(comicPage.initialNumberOfListItems - 1);
});
