import { m } from '#lib/paraglide/messages.js';
import type { Locator, Page } from '@playwright/test';
import { gotoHydrated } from '../../../../../../../tests/e2e/gotoHydrated';

/** The read-only viewer at `/comic/<id>/view`. */
export class ViewPage {
	readonly page: Page;
	readonly comicId: string;
	readonly title: Locator;
	readonly panelHeadings: Locator;
	readonly images: Locator;
	/** The viewer's own sticky header (REQ-299-1); the shared header is not rendered here. */
	readonly header: Locator;
	/** Everything in `<main>`; the ending block's links live here (REQ-299-2). */
	readonly main: Locator;
	readonly headerBackLink: Locator;
	readonly endingBackLink: Locator;
	readonly allComicsLink: Locator;

	constructor(page: Page, comicId: string) {
		this.page = page;
		this.comicId = comicId;
		this.title = page.getByRole('heading', { level: 1 });
		this.panelHeadings = page.getByRole('heading', { level: 2 });
		this.images = page.getByRole('main').getByRole('img');
		this.header = page.getByRole('banner');
		this.main = page.getByRole('main');
		const backToEditing = { name: m.backToEditing(), exact: true };
		this.headerBackLink = this.header.getByRole('link', backToEditing);
		this.endingBackLink = this.main.getByRole('link', backToEditing);
		this.allComicsLink = this.main.getByRole('link', { name: m.allComics(), exact: true });
	}

	async goto() {
		await gotoHydrated(this.page, `/comic/${this.comicId}/view`);
		return this;
	}

	/** The section of panel `number`, found through its (visually hidden) heading. */
	panelSection(number: number): Locator {
		return this.page.locator('section', { has: this.panelHeading(number) });
	}

	/** The image of panel `number`; the cover shares its alt text in the mock, so it is scoped to the section. */
	panelImage(number: number): Locator {
		return this.panelSection(number).getByRole('img');
	}

	panelHeading(number: number): Locator {
		return this.page.getByRole('heading', { name: m.panel({ number }), level: 2, exact: true });
	}
}
