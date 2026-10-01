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

test('deletes image', async ({ page }) => {
	await page.goto(`/comic/${ComicsMock[0].id}/${ComicsMock[0].panels[0].id}`);

	await page.getByRole('button', { name: m.removeImage() }).click();

	await expect(page.getByRole('img', { name: ComicsMock[0].panels[0].image?.alt })).toBeHidden();
});

test('update caption', async ({ page }) => {
	await page.goto(`/comic/${ComicsMock[0].id}/${ComicsMock[0].panels[0].id}`);

	await page
		.getByRole('button', {
			name: m.editCaption({
				number: 1,
			}),
		})
		.click();

	await page.getByRole('textbox', { name: m.editCaption({ number: 1 }) }).fill('NEW CAPTION');
	await page.getByRole('button', { name: m.saveCaption() }).click();

	await expect(page.getByText('NEW CAPTION')).toBeVisible();
});

test('remove caption', async ({ page }) => {
	//TODO: re-seed
	await page.goto(`/comic/${ComicsMock[0].id}/${ComicsMock[0].panels[1].id}`);

	await expect(page.getByText(ComicsMock[0].panels[1].captions[0])).toBeVisible();

	await page
		.getByRole('button', {
			name: m.removeCaption({
				number: 1,
			}),
		})
		.click();

	await expect(page.getByText(ComicsMock[0].panels[1].captions[0])).toBeHidden();
});

test('update dialogue', async ({ page }) => {
	await page.goto(`/comic/${ComicsMock[0].id}/${ComicsMock[0].panels[0].id}`);

	await page
		.getByRole('button', {
			name: m.editDialogue({
				number: 1,
			}),
		})
		.click();

	await page.getByRole('textbox', { name: m.editDialogue({ number: 1 }) }).fill('NEW DIALOGUE');
	await page.getByRole('button', { name: m.saveDialogue() }).click();

	await expect(page.getByText('NEW DIALOGUE')).toBeVisible();
});

test('remove dialogue', async ({ page }) => {
	//TODO: re-seed
	await page.goto(`/comic/${ComicsMock[0].id}/${ComicsMock[0].panels[1].id}`);

	await expect(page.getByText(ComicsMock[0].panels[1].dialogue[0])).toBeVisible();

	await page
		.getByRole('button', {
			name: m.removeDialogue({
				number: 1,
			}),
		})
		.click();

	await expect(page.getByText(ComicsMock[0].panels[1].dialogue[0])).toBeHidden();
});
