import type { Comic } from '#lib/types/index.ts';

class ComicStore {
	private comicsState = $state<Comic[]>([]);

	get comics(): Comic[] {
		return this.comicsState;
	}

	replace(comics: Comic[]): void {
		this.comicsState = comics;
	}
}

export type ComicStoreState = Pick<ComicStore, 'comics' | 'replace'>;

export const comicStore = new ComicStore();
