import { m } from '#lib/paraglide/messages.js';
import { expect, test } from '@playwright/test';
import { EXAMPLE_COMPLETE as EXAMPLE } from '../../../tests/e2e/examples';
import { activate } from '../../../tests/e2e/keyboard';
import { LandingPage } from './utils/landingPage';

test('navigates to create', { tag: ['@REQ-001', '@REQ-295-3'] }, async ({ page }) => {
	const landingPage = await new LandingPage(page).goto();

	await activate(page, landingPage.createTile);

	await expect(page.getByRole('heading', { name: m.createNewComic() })).toBeVisible();
});

test('navigates to comic', { tag: ['@REQ-001', '@REQ-004', '@REQ-235-1'] }, async ({ page }) => {
	const landingPage = await new LandingPage(page).goto();

	await activate(page, landingPage.readLink(EXAMPLE.title));

	await expect(page).toHaveURL(new RegExp(`/comic/${EXAMPLE.id}/view$`));
});

test('removes comic', { tag: '@REQ-002' }, async ({ page }) => {
	const landingPage = await new LandingPage(page).goto();

	await expect(landingPage.card(EXAMPLE.title)).toBeVisible();

	await activate(page, landingPage.deleteComicButton(EXAMPLE.title));

	await expect(landingPage.card(EXAMPLE.title)).toBeHidden();
});

test('redirects to create once every comic is deleted', { tag: '@REQ-003' }, async ({ page }) => {
	const landingPage = await new LandingPage(page).goto();

	await landingPage.deleteAllComics();

	await expect(page).toHaveURL(/\/comic\/create$/);
	await expect(page.getByRole('heading', { name: m.createNewComic() })).toBeVisible();
});
