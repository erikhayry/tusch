import type { Panel } from '$lib/types/index';
import { getComic } from '$lib/utils/db/db';
import { error } from '@sveltejs/kit';

export interface Data {
	panel: Panel;
}

export function load({ params }): Data {
	const comic = getComic(params.id);
	const panel = comic?.panels.find(({ id }) => id === params.panel);

	if (!comic || !panel) {
		error(404, 'Not found');
	}

	return { panel };
}
