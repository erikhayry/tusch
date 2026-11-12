import { expect, test } from '@playwright/test';
import { KEY_COOKIE_NAME, TEXT_MODEL_COOKIE_NAME } from '$lib/utils/cookies';
import { CreatePage } from './utils/createPage';

test('has expected title', async ({ page }) => {
	const createPage = await new CreatePage(page).goto();

	await expect(createPage.heading).toBeVisible();
});

test('submits key', { tag: '@REQ-028' }, async ({ page }) => {
	const createPage = await new CreatePage(page).goto();

	await createPage.submit();

	await expect(createPage.keyInput).toBeHidden();

	await expect(createPage.successMessage).toBeVisible();
});

test(
	'stores the key cookie only after successful validation',
	{ tag: '@REQ-028' },
	async ({ page, context }) => {
		const createPage = await new CreatePage(page).goto();

		await createPage.submit();
		await expect(createPage.successMessage).toBeVisible();

		const cookie = (await context.cookies()).find(({ name }) => name === KEY_COOKIE_NAME);
		expect(decodeURIComponent(cookie?.value ?? '')).toBe('mock key');
		expect(cookie?.httpOnly).toBe(true);
	},
);

test(
	'shows error and stores nothing for an invalid key',
	{ tag: '@REQ-028' },
	async ({ page, context }) => {
		const createPage = await new CreatePage(page).goto();

		await createPage.submit('an invalid key');

		await expect(createPage.invalidKeyMessage).toBeVisible();
		await expect(createPage.keyInput).toBeVisible();
		const cookie = (await context.cookies()).find(({ name }) => name === KEY_COOKIE_NAME);
		expect(cookie).toBeUndefined();
	},
);

test('never exposes the API key in page data', { tag: '@REQ-029' }, async ({ page }) => {
	const createPage = await new CreatePage(page).goto();
	await createPage.submit('sk-secret-value');
	await expect(createPage.successMessage).toBeVisible();

	await page.reload();

	expect(await page.content()).not.toContain('sk-secret-value');
	expect(await page.evaluate(() => document.cookie)).not.toContain('sk-secret-value');
});

test('should set model', { tag: '@REQ-030' }, async ({ page }) => {
	const createPage = await new CreatePage(page).goto();

	await createPage.modelsSelect.selectOption('gpt-6-luna');

	await createPage.saveSettingsButton.click();

	await expect(createPage.currentModel).toHaveText('gpt-6-luna');
});

test(
	'shows the cookie-backed model selection after reload',
	{ tag: '@REQ-030' },
	async ({ page, context }) => {
		await context.addCookies([
			{ name: TEXT_MODEL_COOKIE_NAME, value: 'gpt-6-luna', url: 'http://localhost:4173' },
		]);
		const createPage = await new CreatePage(page).goto();

		await expect(createPage.currentModel).toHaveText('gpt-6-luna');
		await expect(createPage.modelsSelect).toHaveValue('gpt-6-luna');
	},
);

test(
	'keeps the saved model after a reload',
	{ tag: ['@REQ-030', '@REQ-022'] },
	async ({ page }) => {
		const createPage = await new CreatePage(page).goto();
		await createPage.modelsSelect.selectOption('gpt-6-luna');
		await createPage.saveSettingsButton.click();
		await expect(createPage.currentModel).toHaveText('gpt-6-luna');

		await page.reload();

		await expect(createPage.currentModel).toHaveText('gpt-6-luna');
	},
);

test(
	'shows a readable error when key validation is rate limited',
	{ tag: ['@REQ-009', '@REQ-028'] },
	async ({ page, context }) => {
		const createPage = await new CreatePage(page).goto();

		await createPage.submit('sk-mock-error:rate-limit');

		await expect(page.getByTestId('error-test-id')).toContainText(
			'AI provider rate limit reached, try again shortly',
		);
		await expect(createPage.keyInput).toBeVisible();
		const cookie = (await context.cookies()).find(({ name }) => name === KEY_COOKIE_NAME);
		expect(cookie).toBeUndefined();
	},
);
