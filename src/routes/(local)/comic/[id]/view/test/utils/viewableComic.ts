import { m } from '#lib/paraglide/messages.js';
import type { Comic } from '#lib/types/index.ts';
import { expect, type Page } from '@playwright/test';
import {
	createComic,
	generatePanelImage,
	storedComic,
} from '../../../../../../../tests/e2e/createdComic';
import { activate } from '../../../../../../../tests/e2e/keyboard';

/**
 * A comic made through the UI with a cover and a generated image on panel 1:
 * what a real user has, not a bundled example.
 */
export async function createViewableComic(page: Page): Promise<Comic> {
	const id = await createComic(page);
	if (!(await storedComic(page, id)).cover) {
		await activate(page, page.getByRole('button', { name: m.addCover() }));
		await expect.poll(async () => (await storedComic(page, id)).cover).toBeDefined();
	}
	const comic = await storedComic(page, id);
	await generatePanelImage(page, id, comic.panels[0].id);
	return storedComic(page, id);
}

/** Remove a stored image file, as if the browser had cleared OPFS. */
export async function removeStoredFile(page: Page, name: string) {
	await page.evaluate(async (fileName) => {
		const root = await navigator.storage.getDirectory();
		await root.removeEntry(fileName);
	}, name);
}
