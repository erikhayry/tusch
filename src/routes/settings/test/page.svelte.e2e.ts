import { expect, test } from '@playwright/test';
import { m } from '$lib/paraglide/messages';
import { KEY_COOKIE_NAME, TEXT_MODEL_COOKIE_NAME } from '$lib/utils/cookies';
import { LandingPage } from '../../(local)/test/utils/landingPage';
import { gotoHydrated } from '../../../tests/e2e/gotoHydrated';
import { activate, chooseOption, typeInto } from '../../../tests/e2e/keyboard';
import { CreatePage } from './utils/createPage';

test('is titled Settings', { tag: '@REQ-034' }, async ({ page }) => {
	const createPage = await new CreatePage(page).goto();

	await expect(createPage.heading).toBeVisible();
	await expect(page.getByRole('heading', { name: 'TODO' })).toHaveCount(0);
});

test('links back to the start page', { tag: '@REQ-034' }, async ({ page }) => {
	const createPage = await new CreatePage(page).goto();

	await activate(page, createPage.backLink);

	await expect(page).toHaveURL(/\/$/);
	await expect(new LandingPage(page).comicsHeading).toBeVisible();
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

	await chooseOption(page, createPage.modelsSelect, 'gpt-6-luna');

	await activate(page, createPage.saveSettingsButton);

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
		await chooseOption(page, createPage.modelsSelect, 'gpt-6-luna');
		await activate(page, createPage.saveSettingsButton);
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

test('renders without a working key', { tag: '@REQ-031' }, async ({ page, context }) => {
	// The mock gateway fails model listing for this key, like a missing/invalid key.
	await context.addCookies([
		{ name: KEY_COOKIE_NAME, value: 'mock-error:auth', url: 'http://localhost:4173' },
	]);
	const createPage = await new CreatePage(page).goto();

	await expect(createPage.keyInput).toBeVisible();
	await expect(createPage.modelsSelect.getByRole('option')).toHaveCount(0);
});

test.describe('global instructions', () => {
	test(
		'shows an empty labelled field and a save button without a key',
		{ tag: ['@REQ-050', '@REQ-031'] },
		async ({ page }) => {
			const createPage = await new CreatePage(page).goto();

			await expect(createPage.globalInstructionsInput).toBeVisible();
			await expect(createPage.globalInstructionsInput).toHaveValue('');
			await expect(createPage.saveGlobalInstructionsButton).toBeVisible();
		},
	);

	test('shows the saved instructions after a reload', { tag: '@REQ-050' }, async ({ page }) => {
		const createPage = await new CreatePage(page).goto();

		await createPage.saveGlobalInstructions('Keep dialogue short, write in Swedish');
		await expect(
			page.getByRole('status').filter({ hasText: m.globalInstructionsSaved() }),
		).toBeVisible();
		await page.reload();

		await expect(createPage.globalInstructionsInput).toHaveValue(
			'Keep dialogue short, write in Swedish',
		);
	});

	test(
		'stores the instructions only in the browser',
		{ tag: ['@REQ-050', '@REQ-022'] },
		async ({ page, context }) => {
			const createPage = await new CreatePage(page).goto();

			await createPage.saveGlobalInstructions('standing instruction');
			await page.reload();
			await expect(createPage.globalInstructionsInput).toHaveValue('standing instruction');

			const stored = await page.evaluate(() => Object.values(localStorage).join('\n'));
			expect(stored).toContain('standing instruction');
			expect(JSON.stringify(await context.cookies())).not.toContain('standing instruction');
		},
	);

	test(
		'clears the instructions when saving an empty field, and generation works as before',
		{ tag: ['@REQ-050', '@REQ-051'] },
		async ({ page }) => {
			const createPage = await new CreatePage(page).goto();
			// The marker would fail every generation if it were still saved.
			await createPage.saveGlobalInstructions('mock-error:rate-limit');
			await createPage.saveGlobalInstructions('');
			await page.reload();
			await expect(createPage.globalInstructionsInput).toHaveValue('');

			await gotoHydrated(page, '/comic/create');
			await typeInto(page, page.getByRole('textbox', { name: m.url() }), 'https://example.com/a');
			await activate(page, page.getByRole('button', { name: m.submit() }));

			await expect(page).toHaveURL(/\/comic\/[0-9a-f-]{36}$/);
		},
	);

	test(
		'rejects instructions over 1000 characters and keeps the previous ones',
		{ tag: '@REQ-052' },
		async ({ page }) => {
			const createPage = await new CreatePage(page).goto();
			await createPage.saveGlobalInstructions('A');
			await expect(createPage.globalInstructionsInput).toHaveValue('A');

			// The field must accept the 1001st character so the error comes from validation.
			await createPage.saveGlobalInstructions('x'.repeat(1001));

			await expect(createPage.error).toContainText(m.globalInstructionsTooLong());
			await page.reload();
			await expect(createPage.globalInstructionsInput).toHaveValue('A');
		},
	);
});
