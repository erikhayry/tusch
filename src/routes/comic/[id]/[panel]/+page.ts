import type { Panel } from '$lib/types/index';
import { getComic } from '$lib/utils/db/db';

export interface Data {
	panel: Panel;
	panels: Panel[];
	totalNumberOfPanels: number;
	index: number;
	number: number;
	comicId: string;
}

export function load({ params }): Data {
	const comic = getComic(params.id);
	if (!comic) {
		return {};
	}
	const panelIndex = comic?.panels.findIndex(({ id }) => id === params.panel);

	return {
		panels: comic.panels,
		panel: comic.panels[panelIndex],
		number: panelIndex + 1,
		index: panelIndex,
		totalNumberOfPanels: comic.panels.length,
		comicId: params.id,
	};
}
