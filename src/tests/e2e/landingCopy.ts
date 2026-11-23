import type { Comic } from '#lib/types/index.ts';

/**
 * The English copy issue #295 adds for the home view. Literals on purpose: the keys don't
 * exist yet, and `m.createNewComic()` ("Create New Comic") keeps its value in the header while
 * the tile reads "Create new comic". The playwright locale is English.
 */
export const LANDING_COPY = {
	yourComics: 'Your comics',
	noCoverYet: 'No cover yet',
	example: 'Example',
	createTile: 'Create new comic',
	readComic: (title: string) => `Read ${title}`,
	editComic: (title: string) => `Edit ${title}`,
	panelCount: (count: number) => (count === 1 ? '1 panel' : `${count} panels`),
} as const;

const STYLE_NAMES = {
	anime: 'Anime',
	'classic-marvel': 'Classic Marvel',
	'franco-belgian': 'Franco-Belgian',
} as const;

/** The meta line of a card (REQ-295-1). */
export function metaLine(comic: Comic, isExample: boolean): string {
	return [
		...(isExample ? [LANDING_COPY.example] : []),
		STYLE_NAMES[comic.style],
		LANDING_COPY.panelCount(comic.panels.length),
	].join(' · ');
}
