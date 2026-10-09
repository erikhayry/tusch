import { m } from '$lib/paraglide/messages';
import { expect, test } from '@playwright/test';
import { EXAMPLES } from '../../examples/examples';
import { LandingPage } from './utils/landingPage';

test('navigates to create', async ({ page }) => {
	const landingPage = await new LandingPage(page).goto();

	await landingPage.createComicButton.click();

	await expect(page.getByRole('heading', { name: m.createNewComic() })).toBeVisible();
});

test('navigates to comic', async ({ page }) => {
	const landingPage = await new LandingPage(page).goto();

	await landingPage.comicLink(0).click();

	await expect(page.getByRole('heading', { name: EXAMPLES[0].title, level: 2 })).toBeVisible();
});

test('removes comic', async ({ page }) => {
	const landingPage = await new LandingPage(page).goto();

	await expect(landingPage.comicLink(0)).toBeVisible();

	await landingPage.deleteComicButton(EXAMPLES[0].title).click();

	await expect(landingPage.comicLink(0)).toBeHidden();
});

//FIX when no seed
test.skip('redirect to create when no comics', async ({ page }) => {
	const landingPage = await new LandingPage(page).goto();

	await landingPage.deleteComicButton(EXAMPLES[0].title).click();
	await landingPage.deleteComicButton(EXAMPLES[1].title).click();
	await landingPage.deleteComicButton(EXAMPLES[2].title).click();

	await expect(page.getByRole('heading', { name: m.createNewComic() })).toBeVisible();
});
