import { m } from '$lib/paraglide/messages';
import { ComicsMock } from '$lib/types/test/utils/mockTypes';
import { expect, test } from '@playwright/test';
import { LandingPage } from './utils/page';

test.beforeEach(async ({ request }) => {
	await request.post('/api/test/seed');
});

test('navigates to create', async ({ page }) => {
	const landingPage = new LandingPage(page);
	await landingPage.goto();

	await landingPage.createComicButton.click();

	await expect(page.getByRole('heading', { name: m.createNewComic() })).toBeVisible();
});

test('navigates to comic', async ({ page }) => {
	const landingPage = new LandingPage(page);
	await landingPage.goto();

	await landingPage.comicLink.click();

	await expect(page.getByRole('heading', { name: ComicsMock[0].title, level: 2 })).toBeVisible();
});

test('removes comic', async ({ page }) => {
	const landingPage = new LandingPage(page);
	await landingPage.goto();

	await expect(landingPage.comicLink).toBeVisible();

	await landingPage.deleteComicButton.click();

	await expect(landingPage.comicLink).toBeHidden();
});
