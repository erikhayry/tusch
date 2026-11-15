import { m } from '$lib/paraglide/messages';
import { expect, type Locator, type Page } from '@playwright/test';
import { gotoHydrated } from '../../../../tests/e2e/gotoHydrated';
import { KEY_COPY } from '../../../../tests/e2e/keyCopy';
import { activate, typeInto } from '../../../../tests/e2e/keyboard';

export class LandingPage {
	readonly page: Page;
	readonly createComicButton: Locator;
	readonly settingsLink: Locator;
	readonly comicsHeading: Locator;
	readonly comicLink: (title: string) => Locator;
	readonly deleteComicButton: (title: string) => Locator;

	constructor(page: Page) {
		this.page = page;
		this.createComicButton = page.getByRole('link', { name: 'Create' });
		this.settingsLink = page.getByRole('link', { name: m.settings() });
		this.comicsHeading = page.getByRole('heading', { name: m.comics() });
		this.comicLink = (title: string) => page.getByRole('link', { name: title, exact: true });
		this.deleteComicButton = (title: string) =>
			page.getByRole('button', {
				name: m.deleteComic({ title }),
			});
	}

	/** The welcome section (REQ-234-1), found by its heading since it has no other hook. */
	get welcome(): Locator {
		return this.page.locator('section').filter({
			has: this.page.getByRole('heading', { name: KEY_COPY.welcomeHeading }),
		});
	}

	get welcomeHeading(): Locator {
		return this.page.getByRole('heading', { name: KEY_COPY.welcomeHeading });
	}

	get keyInput(): Locator {
		return this.page.getByRole('textbox', { name: KEY_COPY.keyLabel });
	}

	get saveKeyButton(): Locator {
		return this.page.getByRole('button', { name: KEY_COPY.saveKey });
	}

	/** Save a key through the welcome form, keyboard only. */
	async saveKey(key = 'mock key') {
		await typeInto(this.page, this.keyInput, key);
		await this.page.keyboard.press('Enter');

		return this;
	}

	async goto() {
		await gotoHydrated(this.page, '/');

		return this;
	}

	/** Waits for each delete before the next: a press during a pending delete is dropped. */
	async deleteAllComics() {
		const deleteButtons = this.page.getByRole('button', { name: /^Delete Comic / });
		await expect(deleteButtons.first()).toBeVisible();

		for (let remaining = await deleteButtons.count(); remaining > 0; remaining--) {
			await activate(this.page, deleteButtons.first());
			await expect(deleteButtons).toHaveCount(remaining - 1);
		}
	}
}
