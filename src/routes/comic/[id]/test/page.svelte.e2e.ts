import { m } from '$lib/paraglide/messages';
import { ComicsMock } from '$lib/types/test/utils/mockTypes';
import { expect, test } from '@playwright/test';

test('has expected title', async ({ page }) => {
	await page.goto(`/comic/${ComicsMock[0].id}`);

	await expect(page.getByRole('heading', { name: ComicsMock[0].title, level: 2 })).toBeVisible();
});

test('opens panel view', async ({ page }) => {
	await page.goto(`/comic/${ComicsMock[0].id}`);

	await page.getByRole('link', { name: ComicsMock[0].panels[0].id }).click();

	await page.waitForURL(`**/comic/${ComicsMock[0].id}/${ComicsMock[0].panels[0].id}`);
});

test('shows error when comic not found', async ({ page }) => {
	await page.goto(`/comic/XXX/`);

	await expect(page.getByRole('heading', { name: '404' })).toBeVisible();
});

test('remove panel', async ({ page }) => {
	await page.goto(`/comic/${ComicsMock[0].id}`);

	const numberOfPanels = ComicsMock[0].panels.length;
	const listItems = page.getByRole('list', { name: m.panels() }).getByRole('listitem');

	await expect(listItems).toHaveCount(numberOfPanels);

	await page.getByRole('button', { name: m.deletePanel({ number: 3 }) }).click();

	await expect(listItems).toHaveCount(numberOfPanels - 1);
});
