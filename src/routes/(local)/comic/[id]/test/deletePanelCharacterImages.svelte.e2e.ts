import { m } from '$lib/paraglide/messages';
import { expect, test, type Page } from '@playwright/test';
import { EXAMPLES } from '../../../../../examples/examples';
import { gotoHydrated } from '../../../../../tests/e2e/gotoHydrated';
import { activate } from '../../../../../tests/e2e/keyboard';

// The mock panel image only produces crops for the example's characters, so a
// comic created through the UI (other character ids) would have none.
const EXAMPLE = EXAMPLES[0];
const FIRST = { panel: EXAMPLE.panels[0], number: 1 };
const SECOND = { panel: EXAMPLE.panels[1], number: 2 };

type StoredCharacterImage = {
	panelId: string;
	head: { src: string };
	full: { src: string };
};
type StoredComic = {
	panels: { id: string; image?: { landscape: { src: string } } }[];
	characters: { id: string; images: StoredCharacterImage[] }[];
};

function storedComic(page: Page): Promise<StoredComic> {
	return page.evaluate((comicId) => {
		const { comics } = JSON.parse(localStorage.getItem('comics_db') ?? '{"comics":[]}');
		return comics.find((comic: { id: string }) => comic.id === comicId);
	}, EXAMPLE.id);
}

function storedFiles(page: Page): Promise<string[]> {
	return page.evaluate(async () => {
		const root = await navigator.storage.getDirectory();
		const names: string[] = [];
		for await (const name of (root as unknown as { keys(): AsyncIterable<string> }).keys()) {
			names.push(name);
		}
		return names.sort();
	});
}

function imagesFromPanel(comic: StoredComic, panelId: string) {
	return comic.characters.flatMap((character) =>
		character.images.filter((image) => image.panelId === panelId),
	);
}

function filesOf(images: StoredCharacterImage[]) {
	return images.flatMap((image) => [image.head.src, image.full.src]);
}

/** Replace the panel's bundled image with a generated one, which stores character crops. */
async function generatePanelImage(page: Page, panelId: string) {
	await gotoHydrated(page, `/comic/${EXAMPLE.id}/${panelId}`);
	await activate(page, page.getByRole('button', { name: m.removeImage() }));
	await activate(page, page.getByRole('button', { name: m.addImage() }));
	await expect(page.getByRole('img', { name: 'mock alt text' })).toBeVisible();
	await expect.poll(async () => imagesFromPanel(await storedComic(page), panelId)).not.toEqual([]);
}

async function deletePanel(page: Page, number: number) {
	await gotoHydrated(page, `/comic/${EXAMPLE.id}`);
	const panels = page.locator('ul[aria-labelledby="panels"] > li');
	const before = await panels.count();
	await activate(page, page.getByRole('button', { name: m.deletePanel({ number }) }));
	await expect(panels).toHaveCount(before - 1);
}

test.describe('deleting a panel removes its character images', () => {
	test(
		'removes the character images of the panel but keeps the characters',
		{ tag: ['@REQ-040', '@REQ-013'] },
		async ({ page }) => {
			await generatePanelImage(page, FIRST.panel.id);
			const before = await storedComic(page);
			expect(imagesFromPanel(before, FIRST.panel.id)).not.toEqual([]);

			await deletePanel(page, FIRST.number);

			const after = await storedComic(page);
			expect(imagesFromPanel(after, FIRST.panel.id)).toEqual([]);
			expect(after.characters.map(({ id }) => id)).toEqual(before.characters.map(({ id }) => id));
		},
	);

	test(
		'removes the crop files and the panel image file',
		{ tag: ['@REQ-040', '@REQ-025'] },
		async ({ page }) => {
			await generatePanelImage(page, FIRST.panel.id);
			const comic = await storedComic(page);
			const cropFiles = filesOf(imagesFromPanel(comic, FIRST.panel.id));
			const panelFile = comic.panels.find(({ id }) => id === FIRST.panel.id)?.image?.landscape.src;
			if (!panelFile) throw new Error('generated panel image was not stored');
			const stored = await storedFiles(page);
			for (const file of [...cropFiles, panelFile]) expect(stored).toContain(file);

			await deletePanel(page, FIRST.number);

			await expect.poll(() => storedFiles(page)).toEqual([]);
		},
	);

	test(
		'keeps the character images and files from other panels',
		{ tag: '@REQ-040' },
		async ({ page }) => {
			await generatePanelImage(page, FIRST.panel.id);
			await generatePanelImage(page, SECOND.panel.id);
			const comic = await storedComic(page);
			const keptImages = imagesFromPanel(comic, SECOND.panel.id);
			expect(keptImages).not.toEqual([]);
			expect(imagesFromPanel(comic, FIRST.panel.id)).not.toEqual([]);

			await deletePanel(page, FIRST.number);

			const after = await storedComic(page);
			expect(imagesFromPanel(after, FIRST.panel.id)).toEqual([]);
			expect(imagesFromPanel(after, SECOND.panel.id)).toEqual(keptImages);
			const files = await storedFiles(page);
			for (const file of filesOf(keptImages)) expect(files).toContain(file);
		},
	);

	test('stays removed after a reload', { tag: ['@REQ-040', '@REQ-022'] }, async ({ page }) => {
		await generatePanelImage(page, FIRST.panel.id);
		await deletePanel(page, FIRST.number);
		await expect
			.poll(async () => imagesFromPanel(await storedComic(page), FIRST.panel.id))
			.toEqual([]);

		await page.reload();

		await expect(page.getByRole('heading', { name: EXAMPLE.title, level: 2 })).toBeVisible();
		expect(imagesFromPanel(await storedComic(page), FIRST.panel.id)).toEqual([]);
	});
});
