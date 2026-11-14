import { m } from '$lib/paraglide/messages';
import { expect, type Locator, type Page } from '@playwright/test';
import { gotoHydrated } from '../../../../tests/e2e/gotoHydrated';
import { activate } from '../../../../tests/e2e/keyboard';

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
