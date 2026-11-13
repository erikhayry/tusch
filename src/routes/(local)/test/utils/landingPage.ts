import { m } from '$lib/paraglide/messages';
import type { Locator, Page } from '@playwright/test';
import { gotoHydrated } from '../../../../tests/e2e/gotoHydrated';

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
}
