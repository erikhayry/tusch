import type { Comic } from '$lib/types/index.js';
import { globalActions } from '$lib/utils/actions';
import { getComic, getComics } from '$lib/utils/db/db.js';
import { error } from '@sveltejs/kit';

export interface Data {
	comic: Comic;
}

export function load({ params }) {
	const comic = getComic(params.id);

	if (!comic) {
		error(404, `Not found ${params.id} ${JSON.stringify(getComics().values())}`);
	}

	return { comic };
}

export const actions = globalActions;
