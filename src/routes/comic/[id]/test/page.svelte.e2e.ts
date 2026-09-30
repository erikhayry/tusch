import { ComicsMock } from '$lib/types/test/utils/mockTypes';
import { expect, test } from '@playwright/test';

test('has expected title', async ({ page }) => {
	await page.goto(`/comic/${ComicsMock[0].id}`);

	await expect(page.getByRole('heading', { name: ComicsMock[0].title, level: 2 })).toBeVisible();
});

test('opens panel view', async ({ page }) => {
	await page.goto(`/comic/${ComicsMock[0].id}`);

	await page.getByRole('link', { name: ComicsMock[0].panels[0].id }).click();

	await expect(
		page.getByRole('heading', { name: ComicsMock[0].panels[0].id, level: 2 }),
	).toBeVisible();
});

test('shows error when comic not found', async ({ page }) => {
	await page.goto(`/comic/XXX/`);

	await expect(page.getByRole('heading', { name: '404' })).toBeVisible();
});
