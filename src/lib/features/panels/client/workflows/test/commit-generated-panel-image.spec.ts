import { fakeAssetStore } from '$lib/client/assets/test/fake-asset-store';
import { createComicCommands } from '$lib/features/comics/client/comic-commands';
import {
	CHARACTER_ID,
	COMIC_ID,
	MISSING_ID,
	PANEL_A,
	fakeStorage,
	fakeStore,
	makeCharacter,
	makeComic,
	makePanel,
} from '$lib/features/comics/client/test/fixtures';
import type { Comic, Crop, ResponsivePanelImage } from '$lib/types';
import { describe, expect, it, vi } from 'vitest';
import { commitGeneratedPanelImage } from '../commit-generated-panel-image';

const SECOND_CHARACTER = '99999999-9999-4999-8999-999999999999';
const head: Crop = { x: 0, y: 0, width: 10, height: 12 };
const full: Crop = { x: 0, y: 0, width: 30, height: 40 };

function generatedImage(characterIds: string[]): ResponsivePanelImage {
	const landscape = {
		src: 'AAAA',
		width: 100,
		height: 50,
		characters: characterIds.map((id) => ({ id, head, full })),
	};
	return { landscape, portrait: { ...landscape }, alt: 'alt' };
}

function comicWithTwoCharacters(): Comic {
	const comic = makeComic();
	return {
		...comic,
		characters: [makeCharacter(), { ...makeCharacter(), id: SECOND_CHARACTER, images: [] }],
	};
}

function setup(
	options: {
		comics?: Comic[];
		failPutAt?: number;
		failWrite?: boolean;
		crop?: (source: Blob, crop: Crop) => Promise<Blob>;
	} = {},
) {
	const store = fakeStore(options.comics ?? [comicWithTwoCharacters()]);
	const commands = createComicCommands({
		store,
		storage: fakeStorage({ failWrite: options.failWrite }),
	});
	const assets = fakeAssetStore({ failPutAt: options.failPutAt, initial: ['old.webp'] });
	let ids = 0;
	const deps = {
		store,
		commands,
		assets,
		crop: options.crop ?? (async () => new Blob(['crop'])),
		createId: () => `00000000-0000-4000-8000-00000000000${++ids}`,
	};

	return { store, assets, deps };
}

function run(
	deps: ReturnType<typeof setup>['deps'],
	characterIds = [CHARACTER_ID, SECOND_CHARACTER],
) {
	return commitGeneratedPanelImage(deps, {
		comicId: COMIC_ID,
		panelId: PANEL_A,
		image: generatedImage(characterIds),
	});
}

function expectRolledBack({ store, assets }: ReturnType<typeof setup>, before: Comic[]) {
	expect(store.comics).toBe(before);
	expect(store.replaceCalls).toBe(0);
	expect([...assets.files.keys()]).toEqual(['old.webp']);
}

describe('commitGeneratedPanelImage', () => {
	it('stores the panel image and all crops, then commits metadata exactly once', async () => {
		const context = setup();

		const result = await run(context.deps);

		expect(result).toMatchObject({ ok: true });
		expect(context.store.replaceCalls).toBe(1);
		const comic = context.store.comics[0];
		const panel = comic.panels.find(({ id }) => id === PANEL_A)!;
		expect(panel.image?.landscape.src).toBe('asset-1.webp');
		expect(panel.image?.portrait.src).toBe('asset-1.webp');
		const added = comic.characters[0].images.at(-1)!;
		expect(added).toMatchObject({
			panelId: PANEL_A,
			head: { src: 'asset-2.webp', width: head.width, height: head.height },
			full: { src: 'asset-3.webp', width: full.width, height: full.height },
		});
		expect(comic.characters[1].images).toHaveLength(1);
		expect(context.assets.puts).toBe(5);
	});

	it('skips characters that are not part of the comic', async () => {
		const context = setup();

		await run(context.deps, [CHARACTER_ID, MISSING_ID]);

		expect(context.assets.puts).toBe(3);
	});

	it('writes nothing when the panel does not exist (failure before the first write)', async () => {
		const context = setup();
		const before = context.store.comics;

		const result = await commitGeneratedPanelImage(context.deps, {
			comicId: COMIC_ID,
			panelId: MISSING_ID,
			image: generatedImage([CHARACTER_ID]),
		});

		expect(result).toMatchObject({ ok: false, code: 'panel-not-found' });
		expect(context.assets.puts).toBe(0);
		expectRolledBack(context, before);
	});

	it('rolls back the main image when the first crop fails (failure after the main write)', async () => {
		const context = setup({ crop: vi.fn().mockRejectedValue(new Error('crop failed')) });
		const before = context.store.comics;

		const result = await run(context.deps);

		expect(result).toMatchObject({ ok: false, code: 'asset-failed', message: 'crop failed' });
		expect(context.assets.deleted).toEqual(['asset-1.webp']);
		expectRolledBack(context, before);
	});

	it('rolls back every staged asset when a later character crop fails', async () => {
		let crops = 0;
		const context = setup({
			crop: async () => {
				crops += 1;
				if (crops === 4) throw new Error('crop failed');
				return new Blob();
			},
		});
		const before = context.store.comics;

		const result = await run(context.deps);

		expect(result).toMatchObject({ ok: false, code: 'asset-failed', rollback: { ok: true } });
		expect(context.assets.deleted).toEqual([
			'asset-1.webp',
			'asset-2.webp',
			'asset-3.webp',
			'asset-4.webp',
		]);
		expectRolledBack(context, before);
	});

	it('rolls back when a later character write fails', async () => {
		const context = setup({ failPutAt: 4 });
		const before = context.store.comics;

		const result = await run(context.deps);

		expect(result).toMatchObject({ ok: false, code: 'asset-failed', message: 'put 4 failed' });
		expect(context.assets.deleted).toEqual(['asset-1.webp', 'asset-2.webp', 'asset-3.webp']);
		expectRolledBack(context, before);
	});

	it('rolls back when building metadata fails before the commit', async () => {
		const context = setup();
		context.deps.createId = () => {
			throw new Error('no id');
		};
		const before = context.store.comics;

		const result = await run(context.deps);

		expect(result).toMatchObject({ ok: false, code: 'asset-failed', message: 'no id' });
		expectRolledBack(context, before);
	});

	it('rolls back staged assets when the domain commit fails', async () => {
		const context = setup({ failWrite: true });
		const before = context.store.comics;

		const result = await run(context.deps);

		expect(result).toMatchObject({ ok: false, code: 'storage-failed', rollback: { ok: true } });
		expect(context.assets.deleted).toHaveLength(5);
		expectRolledBack(context, before);
	});

	it('removes the replaced panel image after a successful commit', async () => {
		const comic = comicWithTwoCharacters();
		const old = { src: 'old.webp', width: 1, height: 1 };
		comic.panels = [makePanel(PANEL_A, { image: { landscape: old, portrait: old, alt: '' } })];
		const context = setup({ comics: [comic] });

		const result = await run(context.deps, []);

		expect(result).toEqual({ ok: true, cleanup: { ok: true } });
		expect(context.assets.deleted).toEqual(['old.webp']);
	});
});
