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
	readonly backLink: Locator;

	constructor(page: Page, comicId: string) {
		this.page = page;
		this.comicId = comicId;
		this.title = page.getByRole('heading', { level: 1 });
		this.panelHeadings = page.getByRole('heading', { level: 2 });
		this.images = page.getByRole('main').getByRole('img');
		this.backLink = page.getByRole('link', { name: m.back(), exact: true });
	}

	async goto() {
		await gotoHydrated(this.page, `/comic/${this.comicId}/view`);
		return this;
	}

	panelHeading(number: number): Locator {
		return this.page.getByRole('heading', { name: m.panel({ number }), level: 2, exact: true });
	}
}
