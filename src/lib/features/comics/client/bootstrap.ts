import type { Comic } from '$lib/types';
import { EXAMPLES } from '../../../../examples/examples';
import {
	localComicStorage,
	readComicSnapshot,
	serializeComicSnapshot,
	type ComicSnapshotStorage,
} from './comic-persistence';
import { comicStore, type ComicStoreState } from './comic-store.svelte';

export interface ComicBootstrapDeps {
	store: ComicStoreState;
	storage: ComicSnapshotStorage;
	examples?: readonly Comic[];
}

export function seedComics(examples: readonly Comic[] = EXAMPLES): Comic[] {
	const [first] = examples;

	return [
		first,
		{ ...first, id: '6dcbdd2b-a490-473f-bb50-fe7c894b8534', title: 'NIRVANA 2' },
		{ ...first, id: '6dcbdd2b-a490-473f-bb50-fe7c894b8535', title: 'NIRVANA 3' },
	];
}

export function initializeComics({ store, storage, examples = EXAMPLES }: ComicBootstrapDeps) {
	const snapshot = readComicSnapshot(storage.read());

	if (snapshot.status === 'loaded' && snapshot.comics.length > 0) {
		store.replace(snapshot.comics);
		return;
	}

	if (snapshot.status === 'invalid') {
		console.error(
			`Stored comics are invalid (${snapshot.reason}); keeping a copy and seeding examples`,
		);
		storage.preserveInvalid(snapshot.raw);
	}

	const seeded = seedComics(examples);
	store.replace(seeded);

	try {
		storage.write(serializeComicSnapshot(seeded));
	} catch (error) {
		console.error('Failed to save example comics', error);
	}
}

let bootstrapped = false;

export function bootstrapComics(): void {
	if (bootstrapped) return;
	bootstrapped = true;

	initializeComics({ store: comicStore, storage: localComicStorage });
}
