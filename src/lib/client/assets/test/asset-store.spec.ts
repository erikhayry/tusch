import { makeComic } from '$lib/features/comics/client/test/fixtures';
import type { Comic } from '$lib/types';
import { describe, expect, it } from 'vitest';
import {
	collectAssetIds,
	deleteAssets,
	deleteUnreferencedAssets,
	stageAssets,
} from '../asset-store';
import { fakeAssetStore } from './fake-asset-store';

function withCover(comic: Comic, src: string): Comic {
	return {
		...comic,
		cover: {
			alt: '',
			landscape: { src, width: 1, height: 1 },
			portrait: { src, width: 1, height: 1 },
		},
	};
}

describe('asset store helpers', () => {
	it('collects cover, panel and character image ids', () => {
		const comic = withCover(makeComic(), 'cover.webp');
		const ids = collectAssetIds([comic]);

		expect(ids.has('cover.webp')).toBe(true);
		expect(ids.has(comic.characters[0].images[0].head.src)).toBe(true);
		expect(ids.has(comic.characters[0].images[0].full.src)).toBe(true);
	});

	it('deletes each id once and reports failures without throwing', async () => {
		const assets = fakeAssetStore({ failDelete: ['b'] });

		expect(await deleteAssets(assets, ['a', 'a', 'b'])).toEqual({ ok: false, failed: ['b'] });
		expect(assets.deleted).toEqual(['a']);
	});

	it('keeps assets still referenced by another comic', async () => {
		const assets = fakeAssetStore();
		const shared = withCover(makeComic(), 'shared.webp');
		const copy = { ...shared, id: '88888888-8888-4888-8888-888888888888' };

		await deleteUnreferencedAssets(assets, [shared, copy], [copy]);

		expect(assets.deleted).not.toContain('shared.webp');
	});

	it('deletes assets no comic references any more', async () => {
		const assets = fakeAssetStore();
		const comic = makeComic();

		await deleteUnreferencedAssets(assets, [withCover(comic, 'old.webp')], [comic]);

		expect(assets.deleted).toEqual(['old.webp']);
	});

	it('rolls back every staged asset', async () => {
		const assets = fakeAssetStore();
		const staging = stageAssets(assets);
		await staging.put(new Blob());
		await staging.put(new Blob());

		expect(await staging.rollback()).toEqual({ ok: true });
		expect(assets.deleted).toEqual(['asset-1.webp', 'asset-2.webp']);
		expect(assets.files.size).toBe(0);
	});
});
