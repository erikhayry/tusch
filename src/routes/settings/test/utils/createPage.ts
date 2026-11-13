import { m } from '$lib/paraglide/messages';
import { TEXT_MODEL_KEY } from '$lib/types';
import type { Locator, Page } from '@playwright/test';
import { gotoHydrated } from '../../../../tests/e2e/gotoHydrated';
import { typeInto } from '../../../../tests/e2e/keyboard';

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

	constructor(page: Page) {
		this.page = page;
		this.heading = page.getByRole('heading', { name: m.settings(), level: 1 });
		this.backLink = page.getByRole('link', { name: m.back() });
		this.keyInput = page.getByRole('textbox', { name: m.byok() });
		this.successMessage = page.getByText(m.keyAdded());
		this.invalidKeyMessage = page.getByText(m.invalidKey());
		this.modelsSelect = page.getByRole('combobox', { name: m.selectTextModel() });
		this.currentModel = page.getByRole('listitem', { name: TEXT_MODEL_KEY });
		this.saveSettingsButton = page.getByRole('button', { name: m.saveConfig() });
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
