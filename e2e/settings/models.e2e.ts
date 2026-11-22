import { expect, test } from '@playwright/test';
import { reload } from '../support/goto';
import { IMAGE_MODEL, TEXT_MODEL, VALID_KEY } from '../support/mock';
import { SettingsPage } from '../support/settingsPage';

test(
	'the chosen text and image models persist across a reload',
	{ tag: '@REQ-030' },
	async ({ page, context }) => {
		const settings = await new SettingsPage(page).goto();
		await settings.saveKey(VALID_KEY);
		await expect(settings.keySavedMessage).toBeVisible();
		await expect(settings.textModelSelect.getByRole('option', { name: TEXT_MODEL })).toBeAttached();
		await expect(
			settings.imageModelSelect.getByRole('option', { name: IMAGE_MODEL }),
		).toBeAttached();

		await settings.saveModels(TEXT_MODEL, IMAGE_MODEL);

		const current = (name: string) => page.getByRole('listitem', { name });
		await expect(current('textModel')).toHaveText(TEXT_MODEL);
		await expect(current('imageModel')).toHaveText(IMAGE_MODEL);

		await reload(page);

		await expect(current('textModel')).toHaveText(TEXT_MODEL);
		await expect(current('imageModel')).toHaveText(IMAGE_MODEL);
		await expect(settings.textModelSelect).toHaveValue(TEXT_MODEL);
		await expect(settings.imageModelSelect).toHaveValue(IMAGE_MODEL);
		const cookies = await context.cookies();
		expect(cookies.find(({ name }) => name === 'textModel')?.value).toBe(TEXT_MODEL);
		expect(cookies.find(({ name }) => name === 'imageModel')?.value).toBe(IMAGE_MODEL);
	},
);
