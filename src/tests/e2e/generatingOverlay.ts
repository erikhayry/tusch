import { m } from '#lib/paraglide/messages.js';
import { expect, type Locator, type Page } from '@playwright/test';
import { storedComic } from './createdComic';

/** The form action every panel image button posts to. */
export const CREATE_IMAGE_REQUEST = /\?\/create-panel-image/;

/**
 * Hold image requests open for good, so the overlay stays up and only an abort
 * from the browser can end them. Returns the failed requests the browser reports.
 */
export async function holdImageRequestsForever(page: Page): Promise<string[]> {
	const aborted: string[] = [];
	page.on('requestfailed', (request) => {
		if (CREATE_IMAGE_REQUEST.test(request.url())) {
			aborted.push(request.failure()?.errorText ?? 'failed');
		}
	});
	await page.route(CREATE_IMAGE_REQUEST, () => new Promise<void>(() => {}));
	return aborted;
}

export const generatingDialog = (page: Page) =>
	page.getByRole('dialog', { name: m.generatingImageTitle() });

export const cancelGenerationButton = (page: Page) =>
	page.getByRole('button', { name: m.cancelGeneration() });

/** The first panel's heading: its title, or "Panel 1" when it has none. */
export async function firstPanelHeading(page: Page, comicId: string): Promise<Locator> {
	const title = (await storedComic(page, comicId)).panels[0]?.editorialTitle;
	return page.getByRole('heading', { name: title || m.panel({ number: 1 }), exact: true });
}

/** Wait for the stored image of the panel and return it, to compare before and after. */
export async function storedPanelImage(page: Page, comicId: string, panelId: string) {
	const image = (await storedComic(page, comicId)).panels.find((p) => p.id === panelId)?.image;
	expect(image).toBeDefined();
	return image;
}
