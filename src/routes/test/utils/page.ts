import { m } from '$lib/paraglide/messages';
import { ComicsMock } from '$lib/types/test/utils/mockTypes';
import type { Locator, Page } from '@playwright/test';

export class LandingPage {
	readonly page: Page;
	readonly createComicButton: Locator;
	readonly comicLink: Locator;
	readonly deleteComicButton: Locator;

	constructor(page: Page) {
		this.page = page;
		this.createComicButton = page.getByRole('link', { name: 'Create' });
		this.comicLink = page.getByRole('link', { name: ComicsMock[0].title });
		this.deleteComicButton = page.getByRole('button', {
			name: m.deleteComic({ title: ComicsMock[0].title }),
		});
	}

	async goto() {
		await this.page.goto('/');
	}
}
