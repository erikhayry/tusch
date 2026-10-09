import { m } from '$lib/paraglide/messages';
import type { Locator, Page } from '@playwright/test';
import { EXAMPLES } from '../../../examples/examples';

export class LandingPage {
	readonly page: Page;
	readonly createComicButton: Locator;
	readonly comicLink: (number: number) => Locator;
	readonly deleteComicButton: (title: string) => Locator;

	constructor(page: Page) {
		this.page = page;
		this.createComicButton = page.getByRole('link', { name: 'Create' });
		this.comicLink = (number: number) => page.getByRole('link', { name: EXAMPLES[number].title });
		this.deleteComicButton = (title: string) =>
			page.getByRole('button', {
				name: m.deleteComic({ title }),
			});
	}

	async goto() {
		await this.page.goto('/');

		return this;
	}
}
