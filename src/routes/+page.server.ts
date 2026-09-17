import { type Comic } from '$lib/types';
import { ComicsMock } from '$lib/types/test/utils/mockTypes';
import { addComic, getComics } from '$lib/utils/db/db';

export interface Data {
	comics: Comic[];
}

export function load() {
	ComicsMock.forEach((comic) => {
		addComic(comic);
	});

	return {
		comics: getComics()
	};
}
