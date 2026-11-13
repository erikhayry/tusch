import { m } from '$lib/paraglide/messages';
import type { Locator, Page } from '@playwright/test';
import { gotoHydrated } from '../../../../../../tests/e2e/gotoHydrated';
import { activate, typeInto } from '../../../../../../tests/e2e/keyboard';

export class CreatePage {
	readonly page: Page;
	readonly heading: Locator;
	readonly urlInput: Locator;
	readonly submitButton: Locator;
	readonly error: Locator;

	constructor(page: Page) {
		this.page = page;
		this.heading = page.getByRole('heading', { name: m.createNewComic(), level: 1 });
		this.urlInput = page.getByRole('textbox', { name: m.url() });
		this.submitButton = page.getByRole('button', { name: m.submit() });
		this.error = page.getByTestId('error-test-id');
	}

	async fillUrl(url: string) {
		await typeInto(this.page, this.urlInput, url);

		return this;
	}

	async submit() {
		await activate(this.page, this.submitButton);

		return this;
	}

	async goto() {
		await gotoHydrated(this.page, `/comic/create`);

		return this;
	}
}
