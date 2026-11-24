import { expect, test, type BrowserContext } from '@playwright/test';
import { m } from '#lib/paraglide/messages.js';
import { KEY_COOKIE_NAME, TEXT_MODEL_COOKIE_NAME } from '#lib/utils/cookies.ts';
import { LandingPage } from '../../(local)/test/utils/landingPage';
import { KEY_COPY } from '../../../tests/e2e/keyCopy';
import { SETTINGS_COPY } from '../../../tests/e2e/settingsCopy';
import { locales, localizeHref } from '#lib/paraglide/runtime.js';
import { gotoHydrated } from '../../../tests/e2e/gotoHydrated';
import { activate, chooseOption, typeInto } from '../../../tests/e2e/keyboard';
import { CreatePage } from './utils/createPage';

const VALID_KEY = 'sk-valid-key';

/** A stored key, as a user has after saving one. */
function storeKey(context: BrowserContext, value = VALID_KEY) {
	return context.addCookies([{ name: KEY_COOKIE_NAME, value, url: 'http://localhost:4173' }]);
}

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

test(
	'shows the new messages for an accepted and a rejected key',
	{ tag: '@REQ-028' },
	async ({ page }) => {
		const createPage = await new CreatePage(page).goto();
		await createPage.submit('an invalid key');
		await expect(page.getByText(KEY_COPY.invalidKey)).toBeVisible();

		await createPage.submit();

		await expect(page.getByText(KEY_COPY.keySaved)).toBeVisible();
	},
);

test(
	'shows that a key is saved, above the empty key field, without showing it',
	{ tag: ['@REQ-234-4', '@REQ-029'] },
	async ({ page, context }) => {
		await context.addCookies([
			{ name: KEY_COOKIE_NAME, value: 'sk-secret-settings', url: 'http://localhost:4173' },
		]);
		const createPage = await new CreatePage(page).goto();

		await expect(createPage.keyStatus).toBeVisible();
		await expect(createPage.keyBadge).toHaveText(SETTINGS_COPY.en.keyBadgeSaved);
		await expect(createPage.keyInput).toHaveValue('');
		const statusBox = await createPage.keyStatus.boundingBox();
		const inputBox = await createPage.keyInput.boundingBox();
		expect(statusBox?.y).toBeLessThan(inputBox?.y ?? 0);
		expect(await page.content()).not.toContain('sk-secret-settings');
	},
);

test(
	'announces the saved key and drops the add-a-key hint without a reload',
	{ tag: ['@REQ-028', '@REQ-234-5'] },
	async ({ page }) => {
		const createPage = await new CreatePage(page).goto();
		await expect(createPage.noKeyModelsHint).toBeVisible();

		await createPage.submit();

		await expect(page.getByRole('status').filter({ hasText: KEY_COPY.keySaved })).toBeVisible();
		await expect(createPage.noKeyModelsHint).toHaveCount(0);
	},
);

test('shows no key status without a key', { tag: '@REQ-234-4' }, async ({ page }) => {
	const createPage = await new CreatePage(page).goto();

	await expect(createPage.keyInput).toBeVisible();
	await expect(createPage.keyBadge).toHaveText(SETTINGS_COPY.en.keyBadgeMissing);
	await expect(createPage.keyStatus).toHaveCount(0);
});

test(
	'shows the key card heading and the badge, and drops the no-key badge after saving a key',
	{ tag: '@REQ-234-4' },
	async ({ page }) => {
		const createPage = await new CreatePage(page).goto();
		await expect(createPage.keyCardHeading).toBeVisible();
		await expect(page.getByText(SETTINGS_COPY.en.keyBadgeSaved, { exact: true })).toHaveCount(0);

		await createPage.submit();

		await expect(createPage.keyBadge).toHaveText(SETTINGS_COPY.en.keyBadgeSaved);
		await expect(page.getByText(SETTINGS_COPY.en.keyBadgeMissing, { exact: true })).toHaveCount(0);
		await expect(createPage.keyStatus).toBeVisible();
	},
);

test(
	'uses plain labels and shows the add-a-key hint for models without a key',
	{ tag: ['@REQ-234-5', '@REQ-031'] },
	async ({ page }) => {
		const createPage = await new CreatePage(page).goto();

		await expect(page.getByRole('textbox', { name: KEY_COPY.keyLabel })).toBeVisible();
		await expect(createPage.keyHint).toBeVisible();
		await expect(createPage.saveKeyButton).toBeVisible();
		await expect(createPage.modelsHeading).toBeVisible();
		await expect(createPage.saveModelsButton).toBeVisible();
		await expect(createPage.noKeyModelsHint).toBeVisible();
	},
);

test(
	'hides the model hint when a key is stored',
	{ tag: '@REQ-234-5' },
	async ({ page, context }) => {
		// A stored key whose model listing fails: the hint depends on the key, not on empty lists.
		await context.addCookies([
			{ name: KEY_COOKIE_NAME, value: 'mock-error:auth', url: 'http://localhost:4173' },
		]);
		const createPage = await new CreatePage(page).goto();

		await expect(createPage.saveModelsButton).toBeVisible();
		await expect(createPage.noKeyModelsHint).toHaveCount(0);
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

test('should set model', { tag: '@REQ-030' }, async ({ page, context }) => {
	await storeKey(context);
	const createPage = await new CreatePage(page).goto();

	await chooseOption(page, createPage.modelsSelect, 'gpt-6-luna');

	await activate(page, createPage.saveSettingsButton);

	await expect(createPage.currentModel).toHaveText('gpt-6-luna');
});

test(
	'shows the cookie-backed model selection after reload',
	{ tag: '@REQ-030' },
	async ({ page, context }) => {
		await storeKey(context);
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
	async ({ page, context }) => {
		await storeKey(context);
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
			await activate(page, page.getByRole('button', { name: m.createComicSubmit() }));

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

for (const locale of locales) {
	test(`shows the settings copy in ${locale}`, { tag: '@REQ-234-5' }, async ({ page, context }) => {
		const copy = SETTINGS_COPY[locale];
		await storeKey(context);
		await gotoHydrated(page, localizeHref('/settings', { locale }));

		await expect(page.getByRole('heading', { name: copy.keyCardTitle })).toBeVisible();
		const keyField = page.getByRole('textbox', { name: copy.byok, exact: true });
		await expect(keyField).toHaveAttribute('placeholder', 'sk-…');
		await expect(page.getByText(copy.keyBadgeSaved, { exact: true })).toBeVisible();
		const textModel = page.getByRole('combobox', { name: copy.selectTextModel });
		await expect(textModel).toBeVisible();
		await expect(textModel).toHaveAccessibleDescription(copy.textModelHelp);
		const imageModel = page.getByRole('combobox', { name: copy.selectImageModel });
		await expect(imageModel).toHaveAccessibleDescription(copy.imageModelHelp);
		const instructions = page.getByRole('textbox', { name: copy.globalInstructionsLabel });
		await expect(instructions).toHaveAttribute('placeholder', copy.globalInstructionsPlaceholder);
		await expect(instructions).toHaveAccessibleDescription(
			new RegExp(`${copy.globalInstructionsHint}.*${copy.count(0)}`),
		);
		await expect(page.getByRole('button', { name: copy.saveGlobalInstructions })).toBeVisible();
	});

	test(`shows the no-key hint in ${locale}`, { tag: '@REQ-234-5' }, async ({ page }) => {
		await gotoHydrated(page, localizeHref('/settings', { locale }));

		await expect(page.getByText(SETTINGS_COPY[locale].noKeyModelsHint)).toBeVisible();
		await expect(
			page.getByText(SETTINGS_COPY[locale].keyBadgeMissing, { exact: true }),
		).toBeVisible();
	});
}

test.describe('model controls need a key', () => {
	test(
		'are disabled and described by the no-key hint without a key',
		{ tag: '@REQ-300-1' },
		async ({ page }) => {
			const createPage = await new CreatePage(page).goto();

			for (const select of [createPage.modelsSelect, createPage.imageModelSelect]) {
				await expect(select).toBeDisabled();
				await expect(select).toHaveAccessibleDescription(
					new RegExp(SETTINGS_COPY.en.noKeyModelsHint),
				);
			}
			await expect(createPage.saveModelsButton).toBeDisabled();
			// Tab skips disabled controls, so the keyboard never lands on them.
			await createPage.keyInput.focus();
			for (let presses = 0; presses < 6; presses++) {
				await page.keyboard.press('Tab');
				await expect(createPage.modelsSelect).not.toBeFocused();
				await expect(createPage.imageModelSelect).not.toBeFocused();
				await expect(createPage.saveModelsButton).not.toBeFocused();
			}
		},
	);

	test(
		'are enabled with a key, and models can still be saved',
		{ tag: ['@REQ-300-1', '@REQ-030'] },
		async ({ page, context }) => {
			await storeKey(context);
			const createPage = await new CreatePage(page).goto();

			await expect(createPage.modelsSelect).toBeEnabled();
			await expect(createPage.imageModelSelect).toBeEnabled();
			await expect(createPage.saveModelsButton).toBeEnabled();
			await expect(createPage.noKeyModelsHint).toHaveCount(0);

			await chooseOption(page, createPage.modelsSelect, 'gpt-6-luna');
			await activate(page, createPage.saveModelsButton);
			await expect(createPage.currentModel).toHaveText('gpt-6-luna');
		},
	);

	test(
		'become enabled when a key is saved, without a reload',
		{ tag: '@REQ-300-1' },
		async ({ page }) => {
			const createPage = await new CreatePage(page).goto();
			await expect(createPage.modelsSelect).toBeDisabled();

			await createPage.submit();

			await expect(createPage.modelsSelect).toBeEnabled();
			await expect(createPage.imageModelSelect).toBeEnabled();
			await expect(createPage.saveModelsButton).toBeEnabled();
		},
	);
});

test.describe('global instructions counter', () => {
	test('reads the saved length and follows typing', { tag: '@REQ-300-2' }, async ({ page }) => {
		const createPage = await new CreatePage(page).goto();
		await expect(createPage.globalInstructionsCount).toHaveText(SETTINGS_COPY.en.count(0));
		await createPage.saveGlobalInstructions('twelve chars');
		await page.reload();
		await expect(createPage.globalInstructionsInput).toHaveValue('twelve chars');

		await expect(createPage.globalInstructionsCount).toHaveText(SETTINGS_COPY.en.count(12));
		await typeInto(page, createPage.globalInstructionsInput, 'twelve chars!!!');

		await expect(createPage.globalInstructionsCount).toHaveText(SETTINGS_COPY.en.count(15));
	});

	test(
		'is linked to the field and is not a live region',
		{ tag: '@REQ-300-2' },
		async ({ page }) => {
			const createPage = await new CreatePage(page).goto();

			await expect(createPage.globalInstructionsInput).toHaveAccessibleDescription(
				new RegExp(SETTINGS_COPY.en.count(0)),
			);
			// Neither the counter nor an ancestor announces changes (the saved status is a separate element).
			const live = await createPage.globalInstructionsCount.evaluate(
				(el) => el.closest('[aria-live], [role="status"], [role="alert"], output') !== null,
			);
			expect(live).toBe(false);
		},
	);

	test(
		'turns to the danger colour over 1000 characters, and saving shows the error',
		{ tag: ['@REQ-300-2', '@REQ-052'] },
		async ({ page }) => {
			const createPage = await new CreatePage(page).goto();
			const counter = createPage.globalInstructionsCount;
			const colorOf = (locator: typeof counter) =>
				locator.evaluate((el) => getComputedStyle(el).color);
			await typeInto(page, createPage.globalInstructionsInput, 'x'.repeat(1000));
			await expect(counter).toHaveText(SETTINGS_COPY.en.count(1000));
			const normal = await colorOf(counter);

			await typeInto(page, createPage.globalInstructionsInput, 'x'.repeat(1001));

			await expect(counter).toHaveText(SETTINGS_COPY.en.count(1001));
			const danger = await page.evaluate(() => {
				const probe = document.createElement('span');
				probe.style.color = 'var(--color-danger)';
				document.body.append(probe);
				const color = getComputedStyle(probe).color;
				probe.remove();
				return color;
			});
			await expect.poll(() => colorOf(counter)).toBe(danger);
			expect(danger).not.toBe(normal);
			await activate(page, createPage.saveGlobalInstructionsButton);
			await expect(createPage.error).toContainText(m.globalInstructionsTooLong());
		},
	);
});
