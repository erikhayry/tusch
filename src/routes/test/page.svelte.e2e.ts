import { m } from '$lib/paraglide/messages';
import { ComicsMock } from '$lib/types/test/utils/mockTypes';
import { expect, test } from '@playwright/test';

test('navigates to create', async ({ page }) => {
	await page.goto('/');

	await page.getByRole('link', { name: 'Create' }).click();

	await expect(page.getByRole('heading', { name: m.createNewComic() })).toBeVisible();
});

test('shows a list of links to comics', async ({ page }) => {
	await page.goto('/');

	const comicList = page.getByRole('list', { name: m.comics() });

	await expect(comicList.getByRole('link')).toHaveCount(ComicsMock.length);
});

test('navigates to comic', async ({ page }) => {
	await page.goto('/');

	await page.getByRole('link', { name: ComicsMock[0].title }).click();

	await expect(page.getByRole('heading', { name: ComicsMock[0].title, level: 2 })).toBeVisible();
});
