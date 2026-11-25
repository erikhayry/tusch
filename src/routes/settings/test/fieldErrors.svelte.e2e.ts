import { localizeHref } from '#lib/paraglide/runtime.js';
import { expect, test } from '@playwright/test';
import { gotoHydrated } from '../../../tests/e2e/gotoHydrated';
import { CreatePage } from './utils/createPage';

const LIBRARY_DEFAULT = /too small|expected|invalid input/i;
const GENERIC_ENGLISH = /submitted values are invalid/i;

test(
	'marks an empty API key invalid and describes why, in translated words',
	{ tag: '@REQ-201-1' },
	async ({ page }) => {
		const settings = await new CreatePage(page).goto();
		await settings.submit('');

		await expect(settings.keyInput).toHaveAttribute('aria-invalid', 'true');
		await expect(settings.keyInput).not.toHaveAccessibleDescription(LIBRARY_DEFAULT);
		await expect(settings.keyInput).toHaveAccessibleDescription(/\S/);
		await expect(settings.error).not.toContainText(GENERIC_ENGLISH);
	},
);

test(
	'shows the invalid-input message in Swedish on Settings',
	{ tag: ['@REQ-201-1', '@REQ-201-2'] },
	async ({ page }) => {
		await gotoHydrated(page, localizeHref('/settings', { locale: 'sv-se' }));
		const settings = new CreatePage(page, 'sv-se');
		await settings.submit('');

		await expect(settings.keyInput).toHaveAttribute('aria-invalid', 'true');
		await expect(settings.error).toContainText(/\S/);
		await expect(settings.error).not.toContainText(GENERIC_ENGLISH);
		await expect(settings.keyInput).not.toHaveAccessibleDescription(GENERIC_ENGLISH);
	},
);

test(
	'stops marking the key invalid after a valid key is saved',
	{ tag: '@REQ-201-3' },
	async ({ page }) => {
		const settings = await new CreatePage(page).goto();
		await settings.submit('');
		await expect(settings.keyInput).toHaveAttribute('aria-invalid', 'true');

		await settings.submit();

		await expect(settings.successMessage).toBeVisible();
		await expect(settings.keyInput).toHaveCount(0);
	},
);
