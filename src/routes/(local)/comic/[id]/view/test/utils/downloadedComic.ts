import { m } from '#lib/paraglide/messages.js';
import { expect, type Browser, type Download, type Page } from '@playwright/test';
import { activate } from '../../../../../../../tests/e2e/keyboard';
import type { ViewPage } from './viewPage';

export const LANDSCAPE_VIEWPORT = { width: 1280, height: 720 };
export const PORTRAIT_VIEWPORT = { width: 390, height: 844 };

/** The "Download comic" link on the viewer (REQ-88-1). */
export const downloadLink = (page: Page) =>
	page.getByRole('link', { name: m.downloadComic(), exact: true });

/** Activate "Download comic" with the keyboard and return the saved file's name and text. */
export async function downloadComic(
	view: ViewPage,
): Promise<{ download: Download; fileName: string; html: string }> {
	const link = downloadLink(view.page);
	await expect(link).toBeVisible();
	const [download] = await Promise.all([
		view.page.waitForEvent('download'),
		activate(view.page, link),
	]);
	const stream = await download.createReadStream();
	const chunks: Buffer[] = [];
	for await (const chunk of stream) {
		chunks.push(Buffer.from(chunk));
	}
	return {
		download,
		fileName: download.suggestedFilename(),
		html: Buffer.concat(chunks).toString(),
	};
}

/**
 * Open a downloaded file in a fresh, offline context: it has neither Tusch's
 * storage nor a network, so an image that wasn't embedded fails to load.
 */
export async function openOffline(
	browser: Browser,
	html: string,
	viewport = LANDSCAPE_VIEWPORT,
): Promise<Page> {
	const context = await browser.newContext({ offline: true, viewport });
	const page = await context.newPage();
	await page.setContent(html);
	return page;
}

/** Every `<img>` of the page has loaded; returns how many there are. */
export async function loadedImageCount(page: Page): Promise<number> {
	const images = page.locator('img');
	await expect
		.poll(() =>
			images.evaluateAll((elements) =>
				elements.every((element) => (element as HTMLImageElement).naturalWidth > 0),
			),
		)
		.toBe(true);
	return images.count();
}
