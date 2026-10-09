import { m } from '$lib/paraglide/messages';
import { expect, test } from '@playwright/test';
import { EXAMPLES } from '../../examples/examples';
import { LandingPage } from './utils/landingPage';

test.beforeEach(async ({ request }) => {
	await request.post('/api/test/seed');
});

test('navigates to create', async ({ page }) => {
	const landingPage = await new LandingPage(page).goto();

	await landingPage.createComicButton.click();

	await expect(page.getByRole('heading', { name: m.createNewComic() })).toBeVisible();
});

test('navigates to comic', async ({ page }) => {
	const landingPage = await new LandingPage(page).goto();

	await landingPage.comicLink.click();

	await expect(page.getByRole('heading', { name: EXAMPLES[0].title, level: 2 })).toBeVisible();
});

test('removes comic', async ({ page }) => {
	const landingPage = await new LandingPage(page).goto();

	await expect(landingPage.comicLink).toBeVisible();

	await landingPage.deleteComicButton.click();

	await expect(landingPage.comicLink).toBeHidden();
});
