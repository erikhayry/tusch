import { m } from '#lib/paraglide/messages.js';
import { expect, type Locator, type Page } from '@playwright/test';
import { gotoHydrated } from '../../../../../../tests/e2e/gotoHydrated';
import { COMIC_STYLES } from '../../../../../../tests/e2e/comicStyles';
import { activate, tabTo, typeInto } from '../../../../../../tests/e2e/keyboard';

export class CreatePage {
	readonly page: Page;
	readonly heading: Locator;
	readonly urlInput: Locator;
	readonly storyInput: Locator;
	readonly storyCount: Locator;
	readonly panelCountInput: Locator;
	readonly submitButton: Locator;
	readonly error: Locator;

	constructor(page: Page) {
		this.page = page;
		this.heading = page.getByRole('heading', { name: m.createNewComic(), level: 1 });
		this.urlInput = page.getByRole('textbox', { name: m.urlToSource() });
		this.storyInput = page.getByRole('textbox', { name: m.yourStory() });
		this.storyCount = page.getByText(/^[\d,]+ of 10,000$/);
		this.panelCountInput = page.getByRole('spinbutton', { name: m.createComicPanelCount() });
		this.submitButton = page.getByRole('button', { name: m.createComicSubmit() });
		this.error = page.getByTestId('error-test-id');
	}

	/** The style card's radio, found by its name. */
	styleRadio(name: string) {
		return this.page.getByRole('radio', { name });
	}

	/** Arrow from the default (first) style card to the named one, as a keyboard user does. */
	async chooseStyle(name: string) {
		const names = COMIC_STYLES().map((style) => style.name);
		await tabTo(this.page, this.styleRadio(names[0]));
		for (let step = 0; step < names.findIndex((candidate) => candidate === name); step++) {
			await this.page.keyboard.press('ArrowRight');
		}
		await expect(this.styleRadio(name)).toBeChecked();

		return this;
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

	async setPanelCount(count: string) {
		await typeInto(this.page, this.panelCountInput, count);

		return this;
	}

	/** Skip the browser's own validation so the server's check is what answers. */
	async submitToServer() {
		await this.page.locator('form[action$="create-comic"]').evaluate((form) => {
			form.setAttribute('novalidate', '');
		});

		return this.submit();
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
