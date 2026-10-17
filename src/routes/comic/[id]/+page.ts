import type { Comic } from '$lib/types/index.js';
import { getComic } from '$lib/utils/db/db.js';

export const ssr = false;

export interface Data {
	comic: Comic;
}

export function load({ params }) {
	const comic = getComic(params.id);

	return { comic };
}
