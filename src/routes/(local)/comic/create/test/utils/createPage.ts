import { m } from '$lib/paraglide/messages';
import { expect, type Locator, type Page } from '@playwright/test';
import { gotoHydrated } from '../../../../../../tests/e2e/gotoHydrated';
import { activate, tabTo, typeInto } from '../../../../../../tests/e2e/keyboard';

export class CreatePage {
	readonly page: Page;
	readonly heading: Locator;
	readonly urlInput: Locator;
	readonly storyInput: Locator;
	readonly submitButton: Locator;
	readonly error: Locator;

	constructor(page: Page) {
		this.page = page;
		this.heading = page.getByRole('heading', { name: m.createNewComic(), level: 1 });
		this.urlInput = page.getByRole('textbox', { name: m.urlToSource() });
		this.storyInput = page.getByRole('textbox', { name: m.yourStory() });
		this.submitButton = page.getByRole('button', { name: m.submit() });
		this.error = page.getByTestId('error-test-id');
	}

	async fillUrl(url: string) {
		await typeInto(this.page, this.urlInput, url);

		return this;
	}

	/** Keyboard-driven paste: typing 10,000 characters key by key is too slow. */
	async pasteStory(story: string) {
		await expect(this.storyInput).toBeVisible();
		await tabTo(this.page, this.storyInput);
		await this.page.keyboard.press('ControlOrMeta+A');
		await this.page.keyboard.insertText(story);

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
