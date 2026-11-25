import { m } from '#lib/paraglide/messages.js';
import type { Comic } from '#lib/types/index.ts';

/** The copy of the home view (#295), read from the messages so the tests follow the locale. */
export const LANDING_COPY = {
	yourComics: m.yourComics(),
	noCoverYet: m.noCoverYet(),
	example: m.exampleComic(),
	createTile: m.createNewComic(),
	readComic: (title: string) => m.readComic({ title }),
	editComic: (title: string) => m.editComic({ title }),
	panelCount: (count: number) => (count === 1 ? m.panelCountOne() : m.panelCount({ count })),
} as const;

const STYLE_NAMES = {
	anime: m.styleAnime(),
	'classic-marvel': m.styleClassicMarvel(),
	'franco-belgian': m.styleFrancoBelgian(),
	custom: m.styleCustom(),
} as const;

/** The meta line of a card (REQ-295-1). */
export function metaLine(comic: Comic, isExample: boolean): string {
	return [
		...(isExample ? [LANDING_COPY.example] : []),
		STYLE_NAMES[comic.style],
		LANDING_COPY.panelCount(comic.panels.length),
	].join(' · ');
}
