import { m } from '$lib/paraglide/messages';
import { expect, test } from '@playwright/test';
import { exampleTitles } from '../../../tests/e2e/examples';
import { gotoHydrated } from '../../../tests/e2e/gotoHydrated';
import { LandingPage } from './utils/landingPage';

test(
	'seeds exactly the three example comics on a fresh library',
	{ tag: ['@REQ-004', '@REQ-001'] },
	async ({ page }) => {
		const titles = exampleTitles();
		expect(new Set(titles).size).toBe(3);

		await new LandingPage(page).goto();

		const links = page.getByRole('list', { name: m.comics() }).getByRole('link');
		await expect(links).toHaveText(titles);
	},
);

test(
	'seeds the three examples again after they were all deleted',
	{ tag: ['@REQ-003', '@REQ-004'] },
	async ({ page }) => {
		const titles = exampleTitles();
		const landingPage = await new LandingPage(page).goto();
		await expect(page.getByRole('button', { name: /^Delete Comic / })).toHaveCount(3);

		await landingPage.deleteAllComics();
		await expect(page).toHaveURL(/\/comic\/create$/);

		await gotoHydrated(page, '/');

		const links = page.getByRole('list', { name: m.comics() }).getByRole('link');
		await expect(links).toHaveText(titles);
	},
);
