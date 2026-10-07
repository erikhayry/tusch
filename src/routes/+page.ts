import { type Comic } from '$lib/types';
import { getComics } from '$lib/utils/db/db';

export interface Data {
	comics: Comic[];
}

export function load() {
	return {
		comics: getComics(),
	};
}
