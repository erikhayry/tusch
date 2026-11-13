import { m } from '$lib/paraglide/messages';
import { expect, test } from '@playwright/test';
import { EXAMPLES } from '../../../examples/examples';
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

	await activate(page, landingPage.comicLink(0));

	await expect(page.getByRole('heading', { name: EXAMPLES[0].title, level: 2 })).toBeVisible();
});

test('removes comic', { tag: '@REQ-002' }, async ({ page }) => {
	const landingPage = await new LandingPage(page).goto();

	await expect(landingPage.comicLink(0)).toBeVisible();

	await activate(page, landingPage.deleteComicButton(EXAMPLES[0].title));

	await expect(landingPage.comicLink(0)).toBeHidden();
});

test('redirects to create once every comic is deleted', { tag: '@REQ-003' }, async ({ page }) => {
	await new LandingPage(page).goto();
	const deleteButtons = page.getByRole('button', { name: /^Delete Comic / });
	await expect(deleteButtons.first()).toBeVisible();

	for (let remaining = await deleteButtons.count(); remaining > 0; remaining--) {
		await activate(page, deleteButtons.first());
		await expect(deleteButtons).toHaveCount(remaining - 1);
	}

	await expect(page).toHaveURL(/\/comic\/create$/);
	await expect(page.getByRole('heading', { name: m.createNewComic() })).toBeVisible();
});
