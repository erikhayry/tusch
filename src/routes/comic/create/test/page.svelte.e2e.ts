import { expect, test } from '@playwright/test';
import { CreatePage } from './utils/createPage';

test('has expected title', async ({ page }) => {
	const createPage = await new CreatePage(page).goto();

	await expect(createPage.heading).toBeVisible();
});

test.only('is redirected after submit', async ({ page }) => {
	const createPage = await new CreatePage(page).goto();

	await createPage.fillUrl('https://sv.wikipedia.org/wiki/%C3%85dalsh%C3%A4ndelserna');
	await createPage.submit();

	await expect(page.getByRole('heading', { name: 'Comic', level: 1 })).toBeVisible();
});
