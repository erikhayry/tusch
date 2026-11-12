import { afterEach, describe, expect, it, vi } from 'vitest';
import { EXAMPLES } from '../../../../../examples/examples';
import { initializeComics, seedComics } from '../bootstrap';
import { COMIC_SNAPSHOT_VERSION } from '../comic-persistence';
import { fakeStorage, fakeStore, makeComic } from './fixtures';

function storageWith(raw: string | null) {
	return fakeStorage({ raw });
}

describe('initializeComics', () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('seeds the example comics and persists them when storage is missing', () => {
		const store = fakeStore([]);
		const storage = storageWith(null);

		initializeComics({ store, storage });

		expect(store.comics.map(({ title }) => title)).toEqual(seedComics().map(({ title }) => title));
		expect(store.comics).toHaveLength(3);
		expect(storage.writes).toHaveLength(1);
	});

	it('seeds the examples when stored comics are an empty list', () => {
		const store = fakeStore([]);
		const storage = storageWith(JSON.stringify({ version: COMIC_SNAPSHOT_VERSION, comics: [] }));

		initializeComics({ store, storage });

		expect(store.comics).toHaveLength(3);
	});

	it('loads stored comics without reseeding or writing', () => {
		const stored = [makeComic()];
		const store = fakeStore([]);
		const storage = storageWith(
			JSON.stringify({ version: COMIC_SNAPSHOT_VERSION, comics: stored }),
		);

		initializeComics({ store, storage });

		expect(store.comics).toEqual(stored);
		expect(storage.writes).toHaveLength(0);
	});

	it('keeps a copy of corrupt data before seeding examples', () => {
		vi.spyOn(console, 'error').mockImplementation(() => {});
		const store = fakeStore([]);
		const storage = storageWith('{not json');

		initializeComics({ store, storage });

		expect(storage.preserved).toEqual(['{not json']);
		expect(store.comics).toHaveLength(3);
	});

	it('still seeds in memory when the seed cannot be saved', () => {
		const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
		const store = fakeStore([]);
		const storage = fakeStorage({ failWrite: true });

		initializeComics({ store, storage });

		expect(store.comics).toHaveLength(3);
		expect(errorSpy).toHaveBeenCalled();
	});

	it('uses the examples passed in', () => {
		const store = fakeStore([]);

		initializeComics({ store, storage: storageWith(null), examples: [EXAMPLES[0]] });

		expect(store.comics).toHaveLength(3);
		expect(store.comics[0].id).toBe(EXAMPLES[0].id);
	});
});
