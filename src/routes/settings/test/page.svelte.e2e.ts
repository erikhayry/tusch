import { expect, test } from '@playwright/test';
import { CreatePage } from './utils/createPage';

test('has expected title', async ({ page }) => {
	const createPage = await new CreatePage(page).goto();

	await expect(createPage.heading).toBeVisible();
});

test('submits key', async ({ page }) => {
	const createPage = await new CreatePage(page).goto();

	await createPage.submit();

	await expect(createPage.keyInput).toBeHidden();

	expect(createPage.successMessage).toBeVisible();
});
