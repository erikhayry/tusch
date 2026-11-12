import { generateMock } from '$lib/test/utils/generateMock';
import { ResponsivePanelImageSchema } from '$lib/types';
import { describe, expect, it } from 'vitest';
import {
	getCharacterImageForPanel,
	getCharacterName,
	getComic,
	getComics,
	getPanel,
	getPanelsWithCharachter,
} from '../comic-selectors';
import { CHARACTER_ID, COMIC_ID, MISSING_ID, PANEL_A, makeComic, makePanel } from './fixtures';

describe('comic selectors', () => {
	it('returns a copy of the comic list', () => {
		const comics = [makeComic()];

		expect(getComics(comics)).toEqual(comics);
		expect(getComics(comics)).not.toBe(comics);
	});

	it('finds a comic, panel and character by id', () => {
		const comics = [makeComic()];

		expect(getComic(comics, COMIC_ID)?.id).toBe(COMIC_ID);
		expect(getPanel(comics, COMIC_ID, PANEL_A)?.id).toBe(PANEL_A);
		expect(getCharacterName(comics, COMIC_ID, CHARACTER_ID)).toBe(comics[0].characters[0].name);
	});

	it('returns undefined for missing ids', () => {
		const comics = [makeComic()];

		expect(getComic(comics, MISSING_ID)).toBeUndefined();
		expect(getPanel(comics, COMIC_ID, MISSING_ID)).toBeUndefined();
		expect(getCharacterName(comics, MISSING_ID, CHARACTER_ID)).toBeUndefined();
	});

	it('returns the head image of a character for a panel', () => {
		const comics = [makeComic()];
		const head = comics[0].characters[0].images[0].head;

		expect(getCharacterImageForPanel(comics, COMIC_ID, PANEL_A, CHARACTER_ID)).toEqual(head);
	});

	it('returns panels whose image includes the character', () => {
		const crop = { x: 0, y: 0, width: 10, height: 10 };
		const image = generateMock(ResponsivePanelImageSchema);
		const withCharacter = {
			...image,
			landscape: {
				...image.landscape,
				characters: [{ id: CHARACTER_ID, head: crop, full: crop }],
			},
		};
		const comic = makeComic();
		comic.panels = [
			makePanel(PANEL_A, { image: withCharacter }),
			makePanel('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),
		];

		const panels = getPanelsWithCharachter([comic], COMIC_ID, CHARACTER_ID);

		expect(panels?.map(({ id }) => id)).toEqual([PANEL_A]);
	});
});
