import { m } from '#lib/paraglide/messages.js';
import { ComicSchema, type Comic } from '#lib/types/index.ts';
import { expect, test, type Page } from '@playwright/test';
import { createComic, storedComic } from '../../../../../tests/e2e/createdComic';
import { gotoHydrated } from '../../../../../tests/e2e/gotoHydrated';
import { createViewableComic, removeStoredFile } from '../view/test/utils/viewableComic';
import { exportComicData, exportLink, imageSources } from './utils/exportedComic';

const EMPTY_TITLE_URL = 'https://example.com/article/mock-error:empty-title';
/** Characters that are not allowed in file names on common systems. */
const FORBIDDEN_IN_FILE_NAMES = /[\\/:*?"<>|]/;

async function setStoredTitle(page: Page, comicId: string, title: string) {
	await page.evaluate(
		({ id, value }) => {
			const db = JSON.parse(localStorage.getItem('comics_db') ?? '{"comics":[]}');
			db.comics.find((c: { id: string }) => c.id === id).title = value;
			localStorage.setItem('comics_db', JSON.stringify(db));
		},
		{ id: comicId, value: title },
	);
}

/** Exports the comic and parses the envelope's `comic`, which must pass ComicSchema. */
async function exportAndParse(page: Page): Promise<{ json: unknown; comic: Comic }> {
	const { json } = await exportComicData(page);
	return { json, comic: ComicSchema.parse((json as { comic: unknown }).comic) };
}

function expectEveryImageEmbedded(comic: Comic) {
	for (const src of imageSources(comic)) {
		expect(src).toMatch(/^data:image\//);
	}
}

test(
	'the comic page has an Export comic data link in its header that saves one .json file',
	{ tag: '@REQ-90-1' },
	async ({ page }) => {
		const comic = await createViewableComic(page);
		await gotoHydrated(page, `/comic/${comic.id}`);

		const link = exportLink(page);
		await expect(link).toHaveCount(1);
		await expect(link).toBeVisible();
		await expect(link).toHaveAttribute('download');

		const { fileName } = await exportComicData(page);

		expect(fileName).toBe(`${comic.title.trim()}.json`.replace(FORBIDDEN_IN_FILE_NAMES, '-'));
	},
);

test(
	'the file is a versioned envelope whose comic equals the stored one with every image embedded',
	{ tag: '@REQ-90-2' },
	async ({ page }) => {
		const comic = await createViewableComic(page);
		expect(comic.cover).toBeDefined();
		expect(comic.panels[0].image).toBeDefined();
		expect(comic.characters.some((character) => character.images.length > 0)).toBe(true);
		await gotoHydrated(page, `/comic/${comic.id}`);

		const { json, comic: exported } = await exportAndParse(page);

		expect(json).toMatchObject({ format: 'tusch-comic', version: 1 });
		expect(exported.id).toBe(comic.id);
		expect(exported.title).toBe(comic.title);
		expect(exported.characters.map(({ id, name }) => ({ id, name }))).toEqual(
			comic.characters.map(({ id, name }) => ({ id, name })),
		);
		expect(
			exported.panels.map(({ id, captions, dialogue }) => ({ id, captions, dialogue })),
		).toEqual(comic.panels.map(({ id, captions, dialogue }) => ({ id, captions, dialogue })));
		const sources = imageSources(exported);
		expect(sources).toHaveLength(imageSources(comic).length);
		expect(sources.length).toBeGreaterThanOrEqual(3);
		expectEveryImageEmbedded(exported);
	},
);

test.describe('file name', () => {
	test('is "Untitled comic.json" for an empty title', { tag: '@REQ-90-1' }, async ({ page }) => {
		const id = await createComic(page, EMPTY_TITLE_URL);
		expect((await storedComic(page, id)).title).toBe('');
		await gotoHydrated(page, `/comic/${id}`);

		const { fileName } = await exportComicData(page);

		expect(fileName).toBe(`${m.untitledComic()}.json`);
	});

	test(
		'replaces characters that are not allowed in file names',
		{ tag: '@REQ-90-1' },
		async ({ page }) => {
			const id = await createComic(page);
			await setStoredTitle(page, id, 'Who? A/B: "x" <y> |z|');
			await gotoHydrated(page, `/comic/${id}`);

			const { fileName } = await exportComicData(page);

			expect(fileName).toMatch(/\.json$/);
			expect(fileName.slice(0, -'.json'.length)).not.toMatch(FORBIDDEN_IN_FILE_NAMES);
			expect(fileName.length).toBeGreaterThan('.json'.length);
		},
	);
});

test(
	'a comic whose cover file is gone is exported without a cover and with its panel images',
	{ tag: ['@REQ-90-3', '@REQ-036'] },
	async ({ page }) => {
		const comic = await createViewableComic(page);
		const coverSources = [comic.cover?.portrait?.src, comic.cover?.landscape?.src].filter(
			(src): src is string => Boolean(src),
		);
		expect(coverSources.length).toBeGreaterThan(0);
		for (const src of coverSources) {
			await removeStoredFile(page, src);
		}
		await gotoHydrated(page, `/comic/${comic.id}`);

		const { comic: exported } = await exportAndParse(page);

		expect(exported.cover).toBeUndefined();
		expect(exported.panels[0].image).toBeDefined();
		expect(imageSources(exported).length).toBeGreaterThan(0);
		expectEveryImageEmbedded(exported);
	},
);

test(
	'a character image whose head crop file is gone is dropped from the export',
	{ tag: ['@REQ-90-3', '@REQ-036'] },
	async ({ page }) => {
		const comic = await createViewableComic(page);
		const character = comic.characters.find(({ images }) => images.length > 0);
		const image = character?.images[0];
		if (!character || !image) {
			throw new Error('created comic has no character crops');
		}
		await removeStoredFile(page, image.head.src);
		await gotoHydrated(page, `/comic/${comic.id}`);

		const { comic: exported } = await exportAndParse(page);

		const exportedCharacter = exported.characters.find(({ id }) => id === character.id);
		expect(exportedCharacter?.images.map(({ id }) => id)).not.toContain(image.id);
		expect(exported.panels[0].image).toBeDefined();
	},
);
