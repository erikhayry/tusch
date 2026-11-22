import { expect, test } from '@playwright/test';
import { SettingsPage } from '../support/settingsPage';

test(
	'Settings uses the plain labels, hint and buttons',
	{ tag: '@REQ-234-5' },
	async ({ page }) => {
		const settings = await new SettingsPage(page).goto();

		await expect(settings.keyInput).toBeVisible();
		await expect(settings.keyHint).toBeVisible();
		await expect(settings.saveKeyButton).toBeVisible();
		await expect(settings.modelsHeading).toBeVisible();
		await expect(settings.saveModelsButton).toBeVisible();
		await expect(settings.noKeyModelsHint).toBeVisible();
	},
);

test(
	'the add-a-key hint goes away once a key is saved',
	{ tag: '@REQ-234-5' },
	async ({ page }) => {
		const settings = await new SettingsPage(page).goto();
		await expect(settings.noKeyModelsHint).toBeVisible();

		await settings.saveKey('mock key');

		await expect(settings.keySavedMessage).toBeVisible();
		await expect(settings.noKeyModelsHint).toHaveCount(0);
	},
);
