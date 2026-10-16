import { m } from '$lib/paraglide/messages';
import type { Comic } from '$lib/types';
import { getImageFromOpenAiResponse } from '$lib/utils/ai/ai';
import type { Locator, Page } from '@playwright/test';
import { CREATE_COVER_RESPONSE } from '../../../../../tests/mock/openAi/openAiResponse';

export class ComicPage {
	readonly page: Page;
	readonly comic: Comic;
	readonly heading: Locator;
	readonly link: Locator;
	readonly notFound: Locator;
	readonly listItems: Locator;
	readonly initialNumberOfListItems: number;
	readonly deletePanelButton: Locator;
	readonly initialCoverImage: Locator;
	readonly deleteCoverButton: Locator;
	readonly addCoverButton: Locator;
	readonly newCoverImage: Locator;

	constructor(page: Page, comic: Comic) {
		this.page = page;
		this.comic = comic;
		this.heading = page.getByRole('heading', { name: this.comic.title, level: 2 });
		this.link = page.getByRole('link', { name: this.comic.panels[0].id });
		this.notFound = page.getByRole('heading', { name: '404' });
		this.listItems = page.getByRole('list', { name: m.panels() }).getByRole('listitem');
		this.initialNumberOfListItems = this.comic.panels.length;
		this.deletePanelButton = page.getByRole('button', { name: m.deletePanel({ number: 3 }) });
		this.initialCoverImage = page.getByRole('img', { name: this.comic.cover?.alt });
		this.newCoverImage = page.getByRole('img', {
			name: getImageFromOpenAiResponse(CREATE_COVER_RESPONSE).alt,
		});
		this.deleteCoverButton = page.getByRole('button', { name: m.deleteCover() });
		this.addCoverButton = page.getByRole('button', { name: m.addCover() });
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
