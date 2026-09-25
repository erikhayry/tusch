import type { Comic } from '$lib/types/index.js';
import { getComic } from '$lib/utils/db/db.js';
import { error } from '@sveltejs/kit';

export interface Data {
	comic: Comic;
}

export function load({ params }) {
	const comic = getComic(params.id);

	if (!comic) {
		error(404, 'Not found');
	}

	return { comic };
}
