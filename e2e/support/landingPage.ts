import type { Locator, Page } from '@playwright/test';
import { goto } from './goto';
import { typeInto } from './keyboard';
import { m } from './messages';
import { KEY_COPY } from './mock';

/** The start page, with the welcome section (REQ-234-1). */
export class LandingPage {
	readonly settingsLink: Locator;
	readonly comicsHeading: Locator;
	readonly welcome: Locator;
	readonly welcomeHeading: Locator;
	readonly keyInput: Locator;
	readonly saveKeyButton: Locator;

	constructor(readonly page: Page) {
		this.settingsLink = page.getByRole('link', { name: m.settings() });
		this.comicsHeading = page.getByRole('heading', { name: m.comics() });
		this.welcomeHeading = page.getByRole('heading', { name: KEY_COPY.welcomeHeading });
		this.welcome = page.locator('section').filter({ has: this.welcomeHeading });
		this.keyInput = page.getByRole('textbox', { name: KEY_COPY.keyLabel });
		this.saveKeyButton = page.getByRole('button', { name: KEY_COPY.saveKey });
	}

	comicLink(title: string): Locator {
		return this.page.getByRole('link', { name: title, exact: true });
	}

	async goto(): Promise<this> {
		await goto(this.page, '/');
		return this;
	}

	async saveKey(key: string): Promise<void> {
		await typeInto(this.page, this.keyInput, key);
		await this.page.keyboard.press('Enter');
	}
}
