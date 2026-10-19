import { m } from '$lib/paraglide/messages';
import type { Locator, Page } from '@playwright/test';

export class CreatePage {
	readonly page: Page;
	readonly heading: Locator;
	readonly keyInput: Locator;
	readonly successMessage: Locator;
	readonly invalidKeyMessage: Locator;
	readonly modelsSelect: Locator;
	readonly currentModel: Locator;
	readonly saveSettingsButton: Locator;

	constructor(page: Page) {
		this.page = page;
		this.heading = page.getByRole('heading', { name: 'TODO', level: 1 });
		this.keyInput = page.getByRole('textbox', { name: m.byok() });
		this.successMessage = page.getByText(m.keyAdded());
		this.invalidKeyMessage = page.getByText(m.invalidKey());
		this.modelsSelect = page.getByRole('combobox', { name: m.selectModel() });
		this.currentModel = page.getByRole('listitem', { name: 'model' });
		this.saveSettingsButton = page.getByRole('button', { name: m.saveConfig() });
	}

	async submit() {
		await this.keyInput.fill('mock key');
		await this.keyInput.press('Enter');
	}

	async goto(query?: string) {
		await this.page.goto(`/settings${query ? `?${query}` : ''}`);

		return this;
	}
}
