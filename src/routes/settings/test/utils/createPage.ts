import { m } from '#lib/paraglide/messages.js';
import { TEXT_MODEL_KEY } from '#lib/types/index.ts';
import type { Locale } from '#lib/paraglide/runtime.js';
import type { Locator, Page } from '@playwright/test';
import { gotoHydrated } from '../../../../tests/e2e/gotoHydrated';
import { KEY_COPY } from '../../../../tests/e2e/keyCopy';
import { SETTINGS_COPY } from '../../../../tests/e2e/settingsCopy';
import { activate, typeInto } from '../../../../tests/e2e/keyboard';

export class CreatePage {
	readonly page: Page;
	readonly heading: Locator;
	readonly backLink: Locator;
	readonly keyInput: Locator;
	readonly successMessage: Locator;
	readonly invalidKeyMessage: Locator;
	readonly keyStatus: Locator;
	readonly keyHint: Locator;
	readonly noKeyModelsHint: Locator;
	readonly modelsHeading: Locator;
	readonly saveKeyButton: Locator;
	readonly saveModelsButton: Locator;
	readonly modelsSelect: Locator;
	readonly imageModelSelect: Locator;
	readonly keyCardHeading: Locator;
	readonly keyBadge: Locator;
	readonly globalInstructionsCount: Locator;
	readonly currentModel: Locator;
	readonly saveSettingsButton: Locator;
	readonly globalInstructionsInput: Locator;
	readonly saveGlobalInstructionsButton: Locator;
	readonly error: Locator;

	constructor(page: Page, locale: Locale = 'en') {
		this.page = page;
		this.globalInstructionsInput = page.getByRole('textbox', {
			name: SETTINGS_COPY.en.globalInstructionsLabel,
		});
		this.saveGlobalInstructionsButton = page.getByRole('button', {
			name: SETTINGS_COPY.en.saveGlobalInstructions,
		});
		this.error = page.getByTestId('error-test-id');
		this.heading = page.getByRole('heading', { name: m.settings(), level: 1 });
		this.backLink = page.getByRole('link', { name: m.back() });
		this.keyInput = page.getByRole('textbox', {
			name: SETTINGS_COPY[locale === 'en' ? 'en' : 'sv-se'].byok,
			exact: true,
		});
		this.successMessage = page.getByText(m.keyAdded());
		this.invalidKeyMessage = page.getByText(m.invalidKey());
		this.keyStatus = page.getByText(KEY_COPY.keyStatus);
		this.keyHint = page.getByText(KEY_COPY.keyHint);
		this.noKeyModelsHint = page.getByText(KEY_COPY.noKeyModelsHint);
		this.modelsHeading = page.getByRole('heading', { name: KEY_COPY.modelsHeading });
		this.saveKeyButton = page.getByRole('button', { name: KEY_COPY.saveKey });
		this.saveModelsButton = page.getByRole('button', { name: KEY_COPY.saveModels });
		this.modelsSelect = page.getByRole('combobox', { name: SETTINGS_COPY.en.selectTextModel });
		this.imageModelSelect = page.getByRole('combobox', { name: SETTINGS_COPY.en.selectImageModel });
		this.keyCardHeading = page.getByRole('heading', { name: SETTINGS_COPY.en.keyCardTitle });
		this.keyBadge = page.getByText(
			new RegExp(`^(${SETTINGS_COPY.en.keyBadgeSaved}|${SETTINGS_COPY.en.keyBadgeMissing})$`),
		);
		this.globalInstructionsCount = page.getByText(/^\d+ of 1000$/);
		this.currentModel = page.getByRole('listitem', { name: TEXT_MODEL_KEY });
		this.saveSettingsButton = page.getByRole('button', { name: m.saveConfig() });
	}

	/** Save global instructions through the UI, as a user does (empty clears them). */
	async saveGlobalInstructions(text: string) {
		await typeInto(this.page, this.globalInstructionsInput, text);
		await activate(this.page, this.saveGlobalInstructionsButton);

		return this;
	}

	async submit(key = 'mock key') {
		await typeInto(this.page, this.keyInput, key);
		await this.page.keyboard.press('Enter');
	}

	async goto(query?: string) {
		await gotoHydrated(this.page, `/settings${query ? `?${query}` : ''}`);

		return this;
	}
}
