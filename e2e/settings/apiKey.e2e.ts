import { expect, test } from '@playwright/test';
import { reload } from '../support/goto';
import { KEY_COPY, INVALID_KEY, KEY_COOKIE_NAME, VALID_KEY } from '../support/mock';
import { SettingsPage } from '../support/settingsPage';

const keyCookie = (context: import('@playwright/test').BrowserContext) =>
	context.cookies().then((cookies) => cookies.find(({ name }) => name === KEY_COOKIE_NAME));

test.describe('without a stored key', () => {
	test(
		'Settings works, says no key is saved and offers usable model choices',
		{ tag: ['@REQ-031', '@REQ-234-4'] },
		async ({ page }) => {
			const settings = await new SettingsPage(page).goto();

			await expect(settings.heading).toBeVisible();
			await expect(settings.keyInput).toBeVisible();
			await expect(settings.keyInput).toBeEditable();
			await expect(settings.keyStatus).toHaveCount(0);
			await expect(settings.textModelSelect).toBeVisible();
			await expect(settings.imageModelSelect).toBeVisible();
			await expect(settings.saveModelsButton).toBeEnabled();
			await expect(settings.noKeyModelsHint).toBeVisible();
		},
	);
});

test.describe('saving a key', () => {
	test(
		'a valid key is stored (HTTP-only) and Settings shows that a key is saved',
		{ tag: ['@REQ-028', '@REQ-234-4'] },
		async ({ page, context }) => {
			const settings = await new SettingsPage(page).goto();

			await settings.saveKey(VALID_KEY);

			await expect(page.getByRole('status').filter({ hasText: KEY_COPY.keySaved })).toBeVisible();
			const cookie = await keyCookie(context);
			expect(decodeURIComponent(cookie?.value ?? '')).toBe(VALID_KEY);
			expect(cookie?.httpOnly).toBe(true);

			await reload(page);
			await expect(settings.keyStatus).toBeVisible();
			await expect(settings.keyInput).toHaveValue('');
			// The status sits above the key field.
			const statusBox = await settings.keyStatus.boundingBox();
			const inputBox = await settings.keyInput.boundingBox();
			expect(statusBox?.y).toBeLessThan(inputBox?.y ?? 0);
		},
	);

	test(
		'a key containing "invalid" shows a readable error and stores nothing',
		{ tag: ['@REQ-028', '@REQ-234-4'] },
		async ({ page, context }) => {
			const settings = await new SettingsPage(page).goto();

			await settings.saveKey(INVALID_KEY);

			await expect(settings.invalidKeyMessage).toBeVisible();
			await expect(settings.keyInput).toBeVisible();
			expect(await keyCookie(context)).toBeUndefined();

			await reload(page);
			await expect(settings.keyStatus).toHaveCount(0);
		},
	);

	test('a rejected key keeps the previous key', { tag: '@REQ-028' }, async ({ page, context }) => {
		const settings = await new SettingsPage(page).goto();
		await settings.saveKey(VALID_KEY);
		await expect(settings.keySavedMessage).toBeVisible();
		// The form gives way to the confirmation; a returning user sees it again.
		await reload(page);

		await settings.saveKey(INVALID_KEY);

		await expect(settings.invalidKeyMessage).toBeVisible();
		expect(decodeURIComponent((await keyCookie(context))?.value ?? '')).toBe(VALID_KEY);
	});
});
