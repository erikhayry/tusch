import { m } from '$lib/paraglide/messages';
import type { Comic } from '$lib/types';
import type { Locator, Page } from '@playwright/test';

export class ComicPage {
	readonly page: Page;
	readonly comic: Comic;
	readonly heading: Locator;
	readonly link: Locator;
	readonly notFound: Locator;
	readonly listItems: Locator;
	readonly initialNumberOfListItems: number;
	readonly deletePanelButton: Locator;

	constructor(page: Page, comic: Comic) {
		this.page = page;
		this.comic = comic;
		this.heading = page.getByRole('heading', { name: this.comic.title, level: 2 });
		this.link = page.getByRole('link', { name: this.comic.panels[0].id });
		this.notFound = page.getByRole('heading', { name: '404' });
		this.listItems = page.getByRole('list', { name: m.panels() }).getByRole('listitem');
		this.initialNumberOfListItems = this.comic.panels.length;
		this.deletePanelButton = page.getByRole('button', { name: m.deletePanel({ number: 3 }) });
	}

	async goto() {
		await this.page.goto(`/comic/${this.comic.id}`);

		return this;
	}

	async gotoUnknownComic() {
		await this.page.goto(`/comic/XXX`);

		return this;
	}
}
