import { fakeAssetStore } from '$lib/client/assets/test/fake-asset-store';
import { insertGeneratedPanel } from '$lib/features/panels/client/workflows/insert-generated-panel';
import { createCharacterCrop } from '$lib/features/panels/client/workflows/create-character-crop';
import { DB_ITEM_TYPE } from '$lib/utils/db/dbTypes';
import type { Comic, ResponsiveImage } from '$lib/types';
import { describe, expect, it, vi } from 'vitest';
import { createComicCommands } from '../../comic-commands';
import {
	COMIC_ID,
	MISSING_ID,
	OTHER_COMIC_ID,
	PANEL_A,
	fakeStorage,
	fakeStore,
	makeComic,
	makePanel,
} from '../../test/fixtures';
import { expectWorkflow } from '../asset-workflow';
import { commitGeneratedComic } from '../commit-generated-comic';
import { commitGeneratedCover } from '../commit-generated-cover';
import { deleteItemWithAssets } from '../delete-item';

const generatedCover: ResponsiveImage = {
	alt: 'cover',
	landscape: { src: 'AAAA', width: 20, height: 10 },
	portrait: { src: 'AAAA', width: 10, height: 20 },
};

function storedCover(src: string): ResponsiveImage {
	return {
		alt: '',
		landscape: { src, width: 1, height: 1 },
		portrait: { src, width: 1, height: 1 },
	};
}

function setup(
	comics: Comic[] = [makeComic()],
	options: { failPutAt?: number; failWrite?: boolean } = {},
) {
	const store = fakeStore(comics);
	const commands = createComicCommands({
		store,
		storage: fakeStorage({ failWrite: options.failWrite }),
	});
	const assets = fakeAssetStore({ failPutAt: options.failPutAt });

	return { store, assets, deps: { store, commands, assets } };
}

describe('commitGeneratedCover', () => {
	it('stages the image and commits a cover referencing it once', async () => {
		const { store, deps } = setup();

		expect(
			await commitGeneratedCover(deps, { comicId: COMIC_ID, image: generatedCover }),
		).toMatchObject({ ok: true });

		expect(store.replaceCalls).toBe(1);
		expect(store.comics[0].cover).toEqual({
			alt: 'cover',
			landscape: { src: 'asset-1.webp', width: 20, height: 10 },
			portrait: { src: 'asset-1.webp', width: 10, height: 20 },
		});
	});

	it('writes nothing for a missing comic', async () => {
		const { assets, deps } = setup();

		const result = await commitGeneratedCover(deps, { comicId: MISSING_ID, image: generatedCover });

		expect(result).toMatchObject({ ok: false, code: 'comic-not-found' });
		expect(assets.puts).toBe(0);
	});

	it('does not commit when the image write fails', async () => {
		const { store, deps } = setup(undefined, { failPutAt: 1 });

		const result = await commitGeneratedCover(deps, { comicId: COMIC_ID, image: generatedCover });

		expect(result).toMatchObject({ ok: false, code: 'asset-failed' });
		expect(store.replaceCalls).toBe(0);
	});

	it('deletes the staged image when the commit fails', async () => {
		const { assets, deps } = setup(undefined, { failWrite: true });

		const result = await commitGeneratedCover(deps, { comicId: COMIC_ID, image: generatedCover });

		expect(result).toMatchObject({ ok: false, code: 'storage-failed', rollback: { ok: true } });
		expect(assets.deleted).toEqual(['asset-1.webp']);
	});

	it('removes the replaced cover', async () => {
		const { assets, deps } = setup([{ ...makeComic(), cover: storedCover('old.webp') }]);

		await commitGeneratedCover(deps, { comicId: COMIC_ID, image: generatedCover });

		expect(assets.deleted).toEqual(['old.webp']);
	});
});

describe('commitGeneratedComic', () => {
	it('stores the cover before adding the comic', async () => {
		const { store, deps } = setup([]);
		const comic = { ...makeComic(), cover: generatedCover };

		expect(await commitGeneratedComic(deps, comic)).toMatchObject({ ok: true });

		expect(store.replaceCalls).toBe(1);
		expect(store.comics[0].cover?.landscape.src).toBe('asset-1.webp');
		expect(comic.cover.landscape.src).toBe('AAAA');
	});

	it('adds a comic without a cover without writing assets', async () => {
		const { assets, deps } = setup([]);

		expect(await commitGeneratedComic(deps, makeComic())).toMatchObject({ ok: true });
		expect(assets.puts).toBe(0);
	});

	it('adds no comic when the cover write fails', async () => {
		const { store, deps } = setup([], { failPutAt: 1 });

		const result = await commitGeneratedComic(deps, { ...makeComic(), cover: generatedCover });

		expect(result.ok).toBe(false);
		expect(store.comics).toEqual([]);
	});
});

describe('insertGeneratedPanel', () => {
	it('inserts the panel through one command', () => {
		const { store, deps } = setup();
		const panel = makePanel('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');

		expect(insertGeneratedPanel(deps.commands, { comicId: COMIC_ID, panel, index: 0 })).toEqual({
			ok: true,
		});
		expect(store.comics[0].panels[0]).toBe(panel);
	});
});

describe('createCharacterCrop', () => {
	it('crops the stored image', async () => {
		const assets = fakeAssetStore({ initial: ['panel.webp'] });
		const cropped = new Blob(['cropped']);
		const crop = vi.fn().mockResolvedValue(cropped);
		const area = { x: 1, y: 2, width: 3, height: 4 };

		expect(await createCharacterCrop({ assets, crop }, { image: 'panel.webp', crop: area })).toBe(
			cropped,
		);
		expect(crop).toHaveBeenCalledWith(assets.files.get('panel.webp'), area);
	});

	it('rejects when the image is missing', async () => {
		const assets = fakeAssetStore();

		await expect(
			createCharacterCrop(
				{ assets, crop: vi.fn() },
				{ image: 'nope', crop: { x: 0, y: 0, width: 1, height: 1 } },
			),
		).rejects.toThrow('nope missing');
	});
});

describe('deleteItemWithAssets', () => {
	it('removes the cover file when the cover is deleted', async () => {
		const { assets, deps } = setup([{ ...makeComic(), cover: storedCover('cover.webp') }]);

		await deleteItemWithAssets(deps, { type: DB_ITEM_TYPE.enum.coverImage, comicId: COMIC_ID });

		expect(assets.deleted).toEqual(['cover.webp']);
	});

	it('keeps files shared with another comic when a comic is deleted', async () => {
		const shared = { ...makeComic(), cover: storedCover('shared.webp') };
		const { assets, deps } = setup([shared, { ...shared, id: OTHER_COMIC_ID }]);

		await deleteItemWithAssets(deps, { type: DB_ITEM_TYPE.enum.comics, comicId: COMIC_ID });

		expect(assets.deleted).toEqual([]);
	});

	it('removes the panel image when its panel is deleted', async () => {
		const image = storedCover('panel.webp');
		const comic = { ...makeComic(), panels: [makePanel(PANEL_A, { image })] };
		const { assets, deps } = setup([comic]);

		await deleteItemWithAssets(deps, {
			type: DB_ITEM_TYPE.enum.panels,
			comicId: COMIC_ID,
			panelId: PANEL_A,
		});

		expect(assets.deleted).toEqual(['panel.webp']);
	});
});

describe('expectWorkflow', () => {
	it('throws the failure message', () => {
		expect(() => expectWorkflow({ ok: false, code: 'asset-failed', message: 'boom' })).toThrow(
			'boom',
		);
	});

	it('warns instead of throwing when only cleanup failed', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

		expect(() => expectWorkflow({ ok: true, cleanup: { ok: false, failed: ['x'] } })).not.toThrow();
		expect(warn).toHaveBeenCalled();
		warn.mockRestore();
	});
});
