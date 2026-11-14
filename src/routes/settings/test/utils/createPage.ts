import { m } from '$lib/paraglide/messages';
import { TEXT_MODEL_KEY } from '$lib/types';
import type { Locator, Page } from '@playwright/test';
import { gotoHydrated } from '../../../../tests/e2e/gotoHydrated';
import { activate, typeInto } from '../../../../tests/e2e/keyboard';

export class CreatePage {
	readonly page: Page;
	readonly heading: Locator;
	readonly backLink: Locator;
	readonly keyInput: Locator;
	readonly successMessage: Locator;
	readonly invalidKeyMessage: Locator;
	readonly modelsSelect: Locator;
	readonly currentModel: Locator;
	readonly saveSettingsButton: Locator;
	readonly globalInstructionsInput: Locator;
	readonly saveGlobalInstructionsButton: Locator;
	readonly error: Locator;

	constructor(page: Page) {
		this.page = page;
		this.globalInstructionsInput = page.getByRole('textbox', { name: m.globalInstructions() });
		this.saveGlobalInstructionsButton = page.getByRole('button', {
			name: m.saveGlobalInstructions(),
		});
		this.error = page.getByTestId('error-test-id');
		this.heading = page.getByRole('heading', { name: m.settings(), level: 1 });
		this.backLink = page.getByRole('link', { name: m.back() });
		this.keyInput = page.getByRole('textbox', { name: m.byok() });
		this.successMessage = page.getByText(m.keyAdded());
		this.invalidKeyMessage = page.getByText(m.invalidKey());
		this.modelsSelect = page.getByRole('combobox', { name: m.selectTextModel() });
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
