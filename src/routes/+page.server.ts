import { type Comic } from '$lib/types';
import { globalActions } from '$lib/utils/actions';
import { getComics } from '$lib/utils/db/db';

export interface Data {
	comics: Comic[];
}

export function load() {
	return {
		comics: getComics(),
	};
}

export const actions = globalActions;
