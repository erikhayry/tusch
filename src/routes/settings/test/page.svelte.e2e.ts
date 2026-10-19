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

//TODO fix mock failed response
test.skip('shows error if invalid key', async ({ page }) => {
	const createPage = await new CreatePage(page).goto();

	await createPage.submit();

	await expect(createPage.keyInput).toBeHidden();

	expect(createPage.invalidKeyMessage).toBeVisible();
});

test.only('should set model', async ({ page }) => {
	const createPage = await new CreatePage(page).goto();

	await createPage.modelsSelect.selectOption('gpt-image-2.5-flare');

	await createPage.saveSettingsButton.click();

	expect(createPage.currentModel).toHaveText('gpt-image-2.5-flare');
});
