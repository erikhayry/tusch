import type { Page } from '@playwright/test';

/** File names currently stored in OPFS. */
export function storedFiles(page: Page): Promise<string[]> {
	return page.evaluate(async () => {
		const root = await navigator.storage.getDirectory();
		const names: string[] = [];
		for await (const name of (root as unknown as { keys(): AsyncIterable<string> }).keys()) {
			names.push(name);
		}
		return names.sort((a, b) => a.localeCompare(b));
	});
}

/** A stored file's bytes as base64, the form they take inside a `data:` URL. */
export function storedFileBase64(page: Page, name: string): Promise<string> {
	return page.evaluate(async (fileName) => {
		const root = await navigator.storage.getDirectory();
		const file = await (await root.getFileHandle(fileName)).getFile();
		const dataUrl = await new Promise<string>((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = () => resolve(reader.result as string);
			reader.onerror = () => reject(new Error('Failed to read file'));
			reader.readAsDataURL(file);
		});
		return dataUrl.slice(dataUrl.indexOf(',') + 1);
	}, name);
  
/** Size in bytes of every file in OPFS (generated covers, panel images, crops). */
export function storedFileSizes(page: Page): Promise<number[]> {
	return page.evaluate(async () => {
		const root = await navigator.storage.getDirectory();
		const sizes: number[] = [];
		const entries = (
			root as unknown as { entries(): AsyncIterable<[string, FileSystemFileHandle]> }
		).entries();
		for await (const [, handle] of entries) {
			sizes.push((await handle.getFile()).size);
		}
		return sizes;
	});
}

/** The comics currently stored in localStorage, as raw JSON objects. */
export function storedComics(page: Page): Promise<Record<string, unknown>[]> {
	return page.evaluate(
		() => JSON.parse(localStorage.getItem('comics_db') ?? '{"comics":[]}').comics,
	);
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
