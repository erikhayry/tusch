import { m } from '$lib/paraglide/messages';
import type { Locator, Page } from '@playwright/test';

export class CreatePage {
	readonly page: Page;
	readonly heading: Locator;
	readonly keyInput: Locator;
	readonly successMessage: Locator;

	constructor(page: Page) {
		this.page = page;
		this.heading = page.getByRole('heading', { name: 'TODO', level: 1 });
		this.keyInput = page.getByRole('textbox', { name: m.byok() });
		this.successMessage = page.getByText(m.keyAdded());
	}

	async submit() {
		await this.keyInput.fill('mock key');
		await this.keyInput.press('Enter');
	}

	async goto() {
		await this.page.goto(`/settings`);

		return this;
	}
}
