import { expect, test, type Page } from '@playwright/test';
import {
	createComic,
	deletePanel,
	generatePanelImage,
	imagesFromPanel,
	storedComic,
	type CharacterImage,
} from '../../../../../tests/e2e/createdComic';
import { storedFiles } from '../../../../../tests/e2e/storage';

function filesOf(images: CharacterImage[]) {
	return images.flatMap((image) => [image.head.src, image.full.src]);
}

/** A user-created comic whose first panel (and optionally the second) has a generated image. */
async function createComicWithPanelImages(page: Page, count: 1 | 2) {
	const comicId = await createComic(page);
	const { panels } = await storedComic(page, comicId);
	const [first, second] = panels;
	if (!first || !second) throw new Error('created comic needs two panels');
	await generatePanelImage(page, comicId, first.id);
	if (count === 2) await generatePanelImage(page, comicId, second.id);
	return { comicId, first, second };
}

test.describe('deleting a panel removes its character images', () => {
	test(
		'removes the character images of the panel but keeps the characters',
		{ tag: ['@REQ-047', '@REQ-013'] },
		async ({ page }) => {
			const { comicId, first } = await createComicWithPanelImages(page, 1);
			const before = await storedComic(page, comicId);
			expect(imagesFromPanel(before, first.id)).not.toEqual([]);

			await deletePanel(page, comicId, 1);

			const after = await storedComic(page, comicId);
			expect(imagesFromPanel(after, first.id)).toEqual([]);
			expect(after.characters.map(({ id }) => id)).toEqual(before.characters.map(({ id }) => id));
		},
	);

	test(
		'removes the crop files and the panel image file',
		{ tag: ['@REQ-047', '@REQ-025'] },
		async ({ page }) => {
			const { comicId, first } = await createComicWithPanelImages(page, 1);
			const comic = await storedComic(page, comicId);
			const cropFiles = filesOf(imagesFromPanel(comic, first.id));
			const panelFile = comic.panels.find(({ id }) => id === first.id)?.image?.landscape.src;
			if (!panelFile) throw new Error('generated panel image was not stored');
			const stored = await storedFiles(page);
			for (const file of [...cropFiles, panelFile]) expect(stored).toContain(file);

			await deletePanel(page, comicId, 1);

			await expect
				.poll(async () => {
					const files = await storedFiles(page);
					return [...cropFiles, panelFile].filter((file) => files.includes(file));
				})
				.toEqual([]);
		},
	);

	test(
		'keeps the character images and files from other panels',
		{ tag: '@REQ-047' },
		async ({ page }) => {
			const { comicId, first, second } = await createComicWithPanelImages(page, 2);
			const comic = await storedComic(page, comicId);
			const keptImages = imagesFromPanel(comic, second.id);
			expect(keptImages).not.toEqual([]);
			expect(imagesFromPanel(comic, first.id)).not.toEqual([]);
			// The same character has crops from both panels.
			const shared = comic.characters.find(
				({ images }) =>
					images.some(({ panelId }) => panelId === first.id) &&
					images.some(({ panelId }) => panelId === second.id),
			);
			expect(shared).toBeDefined();

			await deletePanel(page, comicId, 1);

			const after = await storedComic(page, comicId);
			expect(imagesFromPanel(after, first.id)).toEqual([]);
			expect(imagesFromPanel(after, second.id)).toEqual(keptImages);
			expect(after.characters.find(({ id }) => id === shared?.id)?.images).toEqual(
				shared?.images.filter(({ panelId }) => panelId === second.id),
			);
			const files = await storedFiles(page);
			for (const file of filesOf(keptImages)) expect(files).toContain(file);
		},
	);

	test('stays removed after a reload', { tag: ['@REQ-047', '@REQ-022'] }, async ({ page }) => {
		const { comicId, first } = await createComicWithPanelImages(page, 1);
		await deletePanel(page, comicId, 1);
		await expect
			.poll(async () => imagesFromPanel(await storedComic(page, comicId), first.id))
			.toEqual([]);

		await page.reload();

		await expect(page.locator('ul[aria-labelledby="panels"]')).toBeVisible();
		expect(imagesFromPanel(await storedComic(page, comicId), first.id)).toEqual([]);
	});
});
