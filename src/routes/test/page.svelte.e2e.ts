import { m } from '$lib/paraglide/messages';
import { ComicsMock } from '$lib/types/test/utils/mockTypes';
import { expect, test } from '@playwright/test';

test.beforeEach(async ({ request }) => {
	await request.post('/api/test/seed');
});

test('navigates to create', async ({ page }) => {
	await page.goto('/');

	await page.getByRole('link', { name: 'Create' }).click();

	await expect(page.getByRole('heading', { name: m.createNewComic() })).toBeVisible();
});

test('navigates to comic', async ({ page }) => {
	await page.goto('/');

	await page.getByRole('link', { name: ComicsMock[0].title }).click();

	await expect(page.getByRole('heading', { name: ComicsMock[0].title, level: 2 })).toBeVisible();
});

test('removes comic', async ({ page }) => {
	await page.goto('/');

	await expect(page.getByRole('link', { name: ComicsMock[0].title })).toBeVisible();

	await page.getByRole('button', { name: m.deleteComic({ title: ComicsMock[0].title }) }).click();

	await expect(page.getByRole('link', { name: ComicsMock[0].title })).toBeHidden();
});
