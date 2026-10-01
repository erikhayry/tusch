import type { Panel } from '$lib/types/index';
import { globalActions } from '$lib/utils/actions';
import { getComic } from '$lib/utils/db/db';
import { error } from '@sveltejs/kit';

export interface Data {
	panel: Panel;
	totalNumberOfPanels: number;
	number: number;
	comicId: string;
}

export function load({ params }): Data {
	const comic = getComic(params.id);
	const panelIndex = comic?.panels.findIndex(({ id }) => id === params.panel);

	if (!comic || panelIndex === undefined) {
		error(404, 'Not found');
	}

	return {
		panel: comic.panels[panelIndex],
		number: panelIndex + 1,
		totalNumberOfPanels: comic.panels.length,
		comicId: params.id,
	};
}

export const actions = globalActions;
