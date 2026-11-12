import { m } from '$lib/paraglide/messages';
import { expect, test } from '@playwright/test';
import { EXAMPLES } from '../../../examples/examples';
import { LandingPage } from './utils/landingPage';

test('navigates to create', { tag: '@REQ-001' }, async ({ page }) => {
	const landingPage = await new LandingPage(page).goto();

	await landingPage.createComicButton.click();

	await expect(page.getByRole('heading', { name: m.createNewComic() })).toBeVisible();
});

test('navigates to comic', { tag: ['@REQ-001', '@REQ-004'] }, async ({ page }) => {
	const landingPage = await new LandingPage(page).goto();

	await landingPage.comicLink(0).click();

	await expect(page.getByRole('heading', { name: EXAMPLES[0].title, level: 2 })).toBeVisible();
});

test('removes comic', { tag: '@REQ-002' }, async ({ page }) => {
	const landingPage = await new LandingPage(page).goto();

	await expect(landingPage.comicLink(0)).toBeVisible();

	await landingPage.deleteComicButton(EXAMPLES[0].title).click();

	await expect(landingPage.comicLink(0)).toBeHidden();
});

test('redirects to create once every comic is deleted', { tag: '@REQ-003' }, async ({ page }) => {
	await new LandingPage(page).goto();
	const deleteButtons = page.getByRole('button', { name: /^Delete Comic / });
	await expect(deleteButtons.first()).toBeVisible();

	for (let remaining = await deleteButtons.count(); remaining > 0; remaining--) {
		await deleteButtons.first().click();
		await expect(deleteButtons).toHaveCount(remaining - 1);
	}

	await expect(page).toHaveURL(/\/comic\/create$/);
	await expect(page.getByRole('heading', { name: m.createNewComic() })).toBeVisible();
});
