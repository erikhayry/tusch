import { expect, test } from '@playwright/test';
import { activate } from '../support/keyboard';
import { LandingPage } from '../support/landingPage';
import { SettingsPage } from '../support/settingsPage';

test(
	'the start page links to Settings, which is titled Settings and links back',
	{ tag: '@REQ-034' },
	async ({ page }) => {
		const landing = await new LandingPage(page).goto();

		await activate(page, landing.settingsLink);

		const settings = new SettingsPage(page);
		await expect(page).toHaveURL(/\/settings$/);
		await expect(settings.heading).toBeVisible();
		await expect(page).toHaveTitle(/Settings/);

		await activate(page, settings.backLink);

		await expect(page).toHaveURL(/\/$/);
		await expect(landing.comicsHeading).toBeVisible();
	},
);
