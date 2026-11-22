import { expect, test } from '@playwright/test';
import { reload } from '../support/goto';
import { SettingsPage } from '../support/settingsPage';

const MAX_LENGTH = 1000;

test.describe('global instructions', () => {
	test(
		'are saved in the browser only, shown after a reload, and cleared by saving an empty field',
		{ tag: '@REQ-050' },
		async ({ page, context }) => {
			const settings = await new SettingsPage(page).goto();
			await expect(settings.instructionsInput).toHaveValue('');
			const text = 'Keep dialogue short, write in Swedish';

			await settings.saveInstructions(text);
			await expect(settings.instructionsSaved).toBeVisible();
			await reload(page);

			await expect(settings.instructionsInput).toHaveValue(text);
			const stored = await page.evaluate(() => Object.values(localStorage).join('\n'));
			expect(stored).toContain(text);
			expect(JSON.stringify(await context.cookies())).not.toContain(text);

			await settings.saveInstructions('');
			await expect(settings.instructionsSaved).toBeVisible();
			await reload(page);
			await expect(settings.instructionsInput).toHaveValue('');
		},
	);

	test('accept exactly 1000 characters', { tag: '@REQ-050' }, async ({ page }) => {
		const settings = await new SettingsPage(page).goto();
		const text = 'y'.repeat(MAX_LENGTH);

		await settings.saveInstructions(text);
		await reload(page);

		await expect(settings.instructionsInput).toHaveValue(text);
	});

	test(
		'over 1000 characters are rejected with a visible message and the previous ones are kept',
		{ tag: '@REQ-052' },
		async ({ page }) => {
			const settings = await new SettingsPage(page).goto();
			await settings.saveInstructions('A');
			await expect(settings.instructionsInput).toHaveValue('A');

			await settings.saveInstructions('x'.repeat(MAX_LENGTH + 1));

			await expect(settings.instructionsTooLong).toBeVisible();
			await reload(page);
			await expect(settings.instructionsInput).toHaveValue('A');
		},
	);
});
