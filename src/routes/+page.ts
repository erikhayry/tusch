import { goto } from '$app/navigation';
import { resolve } from '$app/paths';
import { type Comic } from '$lib/types';
import { getComics } from '$lib/utils/db/db';

export interface Props {
	comics: Comic[];
}

export function load() {
	const comics = getComics();

	if (comics.length === 0) {
		return goto(resolve('/comic/create'));
	}

	return {
		comics: getComics(),
	};
}
