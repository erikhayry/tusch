import { expect, test } from '@playwright/test';
import { CreatePage } from './utils/createPage';

test('has expected title', async ({ page }) => {
	const createPage = await new CreatePage(page).goto();

	await expect(createPage.heading).toBeVisible();
});

test('is redirected after submit', async ({ page }) => {
	const createPage = await new CreatePage(page).goto();

	await createPage.fillUrl('https://sv.wikipedia.org/wiki/%C3%85dalsh%C3%A4ndelserna');
	await createPage.submit();

	await expect(page.getByRole('heading', { name: 'Comic', level: 1 })).toBeVisible();
});

test('error message is displayed when submitting with invalid URL', async ({ page }) => {
	const createPage = await new CreatePage(page).goto();
	await createPage.fillUrl('INVALID_URL');
	await createPage.submit();

	await expect(createPage.error).toBeVisible();
});

test('error message is removed when submitting with valid URL', async ({ page }) => {
	const createPage = await new CreatePage(page).goto();
	await createPage.fillUrl('INVALID_URL');
	await createPage.submit();

	await createPage.fillUrl('https://sv.wikipedia.org/wiki/%C3%85dalsh%C3%A4ndelserna');
	await createPage.submit();

	await expect(createPage.error).toBeHidden();
});
