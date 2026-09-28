import { m } from '$lib/paraglide/messages';
import { expect, test } from '@playwright/test';

test('has expected title', async ({ page }) => {
	await page.goto(`/comic/create`);

	await expect(page.getByRole('heading', { name: m.createNewComic(), level: 1 })).toBeVisible();
});

test('url is submitted', async ({ page }) => {
	await page.goto(`/comic/create`);
	await page.fill('input[name="url"]', 'https://sv.wikipedia.org/wiki/%C3%85dalsh%C3%A4ndelserna');
	await page.click('button[type="submit"]');

	await expect(
		page.getByText('Url https://sv.wikipedia.org/wiki/%C3%85dalsh%C3%A4ndelserna'),
	).toBeVisible();
});
