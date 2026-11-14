import { m } from '$lib/paraglide/messages';
import { expect, test } from '@playwright/test';
import { EXAMPLE_COMPLETE as EXAMPLE } from '../../../tests/e2e/examples';
import { activate } from '../../../tests/e2e/keyboard';
import { LandingPage } from './utils/landingPage';

test('navigates to create', { tag: '@REQ-001' }, async ({ page }) => {
	const landingPage = await new LandingPage(page).goto();

	await activate(page, landingPage.createComicButton);

	await expect(page.getByRole('heading', { name: m.createNewComic() })).toBeVisible();
});

test('navigates to settings', { tag: '@REQ-034' }, async ({ page }) => {
	const landingPage = await new LandingPage(page).goto();

	await activate(page, landingPage.settingsLink);

	await expect(page).toHaveURL(/\/settings$/);
	await expect(page.getByRole('heading', { name: m.settings(), level: 1 })).toBeVisible();
});

test('navigates to comic', { tag: ['@REQ-001', '@REQ-004'] }, async ({ page }) => {
	const landingPage = await new LandingPage(page).goto();

	await activate(page, landingPage.comicLink(EXAMPLE.title));

	await expect(page.getByRole('heading', { name: EXAMPLE.title, level: 2 })).toBeVisible();
});

test('removes comic', { tag: '@REQ-002' }, async ({ page }) => {
	const landingPage = await new LandingPage(page).goto();

	await expect(landingPage.comicLink(EXAMPLE.title)).toBeVisible();

	await activate(page, landingPage.deleteComicButton(EXAMPLE.title));

	await expect(landingPage.comicLink(EXAMPLE.title)).toBeHidden();
});

test('redirects to create once every comic is deleted', { tag: '@REQ-003' }, async ({ page }) => {
	const landingPage = await new LandingPage(page).goto();

	await landingPage.deleteAllComics();

	await expect(page).toHaveURL(/\/comic\/create$/);
	await expect(page.getByRole('heading', { name: m.createNewComic() })).toBeVisible();
});
