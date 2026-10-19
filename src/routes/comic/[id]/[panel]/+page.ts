import type { Character, ComicStyle, Panel } from '$lib/types/index';
import { getComic } from '$lib/utils/db/db.svelte';

export interface Props {
	panel: Panel;
	panels: Panel[];
	totalNumberOfPanels: number;
	index: number;
	number: number;
	comicId: string;
	style: ComicStyle;
	characters: Character[];
}

export function load({ params }): Props {
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
		style: comic.style,
		characters: comic.characters,
	};
}
