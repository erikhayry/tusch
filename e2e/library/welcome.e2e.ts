import { expect, test } from '@playwright/test';
import { reload } from '../support/goto';
import { EXAMPLES } from '../../src/examples/examples';
import { KEY_COPY, INVALID_KEY, VALID_KEY } from '../support/mock';
import { LandingPage } from '../support/landingPage';

test(
	'a new visitor sees the welcome section and key form above the comic list',
	{ tag: ['@REQ-234-1'] },
	async ({ page }) => {
		const landing = await new LandingPage(page).goto();

		await expect(landing.welcomeHeading).toBeVisible();
		await expect(landing.welcome.getByText(KEY_COPY.welcomeSentence)).toBeVisible();
		await expect(landing.keyInput).toBeVisible();
		await expect(landing.saveKeyButton).toBeVisible();
		for (const { title } of EXAMPLES) {
			await expect(landing.comicLink(title)).toBeVisible();
		}
		const welcomeBox = await landing.welcomeHeading.boundingBox();
		const comicsBox = await landing.comicsHeading.boundingBox();
		expect(welcomeBox?.y).toBeLessThan(comicsBox?.y ?? 0);
	},
);

test(
	'saving a key there stores it, replaces the form with a confirmation and hides the section on return',
	{ tag: ['@REQ-234-2', '@REQ-234-3'] },
	async ({ page }) => {
		const landing = await new LandingPage(page).goto();

		await landing.saveKey(VALID_KEY);

		await expect(landing.welcome.getByRole('status')).toHaveText(KEY_COPY.keySaved);
		await expect(landing.welcome.getByRole('link', { name: KEY_COPY.createComic })).toBeVisible();
		await expect(landing.keyInput).toBeHidden();

		await reload(page);

		await expect(landing.comicsHeading).toBeVisible();
		await expect(landing.welcomeHeading).toHaveCount(0);
		await expect(landing.keyInput).toHaveCount(0);
	},
);

test(
	'a rejected key shows the invalid-key message and keeps the form',
	{ tag: '@REQ-234-3' },
	async ({ page }) => {
		const landing = await new LandingPage(page).goto();

		await landing.saveKey(INVALID_KEY);

		await expect(landing.welcome.getByRole('status')).toHaveText(KEY_COPY.invalidKey);
		await expect(landing.keyInput).toBeVisible();
		await reload(page);
		await expect(landing.welcomeHeading).toBeVisible();
	},
);
