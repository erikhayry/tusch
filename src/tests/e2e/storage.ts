import type { Page } from '@playwright/test';

/** File names currently stored in OPFS. */
export function storedFiles(page: Page): Promise<string[]> {
	return page.evaluate(async () => {
		const root = await navigator.storage.getDirectory();
		const names: string[] = [];
		for await (const name of (root as unknown as { keys(): AsyncIterable<string> }).keys()) {
			names.push(name);
		}
		return names.sort();
	});
}

/** The stored src of a panel's current image, if any. */
export function panelImageSrc(
	page: Page,
	comicId: string,
	panelId: string,
): Promise<string | undefined> {
	return page.evaluate(
		({ comicId, panelId }) => {
			const { comics } = JSON.parse(localStorage.getItem('comics_db') ?? '{"comics":[]}');
			const comic = comics.find((c: { id: string }) => c.id === comicId);
			return comic?.panels.find((p: { id: string }) => p.id === panelId)?.image?.landscape.src;
		},
		{ comicId, panelId },
	);
}
