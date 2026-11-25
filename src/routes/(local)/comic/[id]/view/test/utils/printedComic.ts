import type { Comic } from '#lib/types/index.ts';
import type { Browser, Page } from '@playwright/test';
import { downloadComic, openOffline } from './downloadedComic';
import { ViewPage } from './viewPage';

/** An A4 page at 96 dpi (210 × 297 mm), the size printing is asserted at (REQ-89-1). */
export const A4_VIEWPORT = { width: 794, height: 1123 };

/** What is printed: the viewer, or the file "Download comic" saves (both carry the print rules). */
export const PRINT_TARGETS = ['viewer', 'downloaded file'] as const;
export type PrintTarget = (typeof PRINT_TARGETS)[number];

/** Open the comic in print media, in the viewer or in its downloaded file, at `viewport`. */
export async function openPrinted(
	target: PrintTarget,
	{ page, browser }: { page: Page; browser: Browser },
	comic: Comic,
	viewport = A4_VIEWPORT,
): Promise<Page> {
	// The download is made on screen, as a user does before printing the file.
	const view = await new ViewPage(page, comic.id).goto();
	let printed = page;
	if (target === 'downloaded file') {
		const { html } = await downloadComic(view);
		printed = await openOffline(browser, html, viewport);
	} else {
		await page.setViewportSize(viewport);
	}
	await printed.emulateMedia({ media: 'print' });
	return printed;
}
