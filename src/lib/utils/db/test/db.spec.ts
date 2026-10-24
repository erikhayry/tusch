import { generateMock, generateMocks } from '$lib/test/utils/generateMock';
import { CharacterImageSchema, ComicSchema, PanelSchema, type Comic } from '$lib/types';
import {
	addCharacterImage,
	addComic,
	addCoverImage,
	addPanel,
	addPanelImage,
	clearComics,
	deleteComic,
	deleteCoverImage,
	deletePanelImage,
	deleteType,
	editType,
	getCharacter,
	getCharacterName,
	getComic,
	getPanelsWithCharachter,
	removeCharacterImage,
} from '$lib/utils/db/db.svelte';
import { beforeEach, describe, expect, it } from 'vitest';
import { DB_ITEM_TYPE } from '../dbTypes';

let ComicsMock: Comic[] = [];

describe('Db', () => {
	beforeEach(() => {
		ComicsMock = generateMocks(ComicSchema, 3);
		clearComics();
		addComic(ComicsMock[0]);
	});

	describe('addComic', () => {
		it('should add comic', () => {
			expect(addComic(ComicsMock[0])[0].id).toEqual(ComicsMock[0].id);
		});
	});

	describe('getComic', () => {
		it('should return comic from db', () => {
			expect(getComic(ComicsMock[0].id)!.id).toEqual(ComicsMock[0].id);
		});
	});

	describe('removeComic', () => {
		it('should remove comic', () => {
			addComic(ComicsMock[1]);

			expect(deleteComic(ComicsMock[0].id)).toEqual([ComicsMock[1]]);
		});
	});

	it('should remove cover image', () => {
		deleteCoverImage(ComicsMock[0].id);

		expect(getComic(ComicsMock[0].id)?.cover).toBeUndefined();
	});

	it('should add cover image', () => {
		const image = {
			landscape: { src: 'https://example.com/wide.jpg', width: 100, height: 100 },
			portrait: { src: 'https://example.com/narrow.jpg', width: 100, height: 100 },
			alt: '',
		};
		deleteCoverImage(ComicsMock[0].id);
		addCoverImage(ComicsMock[0].id, image);

		expect(getComic(ComicsMock[0].id)?.cover).toEqual(image);
	});

	describe('addImage image', () => {
		it('should add image', () => {
			ComicsMock[0].panels[0].image = undefined;

			const image = {
				landscape: { src: 'https://example.com/wide.jpg', width: 100, height: 100 },
				portrait: { src: 'https://example.com/narrow.jpg', width: 100, height: 100 },
				alt: '',
			};

			addPanelImage(ComicsMock[0].id, ComicsMock[0].panels[0].id, image);

			expect(getComic(ComicsMock[0].id)?.panels[0].image).toEqual(image);
		});

		it('should replace image', () => {
			const image = {
				landscape: { src: 'https://example.com/wide.jpg', width: 100, height: 100 },
				portrait: { src: 'https://example.com/narrow.jpg', width: 100, height: 100 },
				alt: '',
			};

			addPanelImage(ComicsMock[0].id, ComicsMock[0].panels[0].id, image);

			expect(getComic(ComicsMock[0].id)?.panels[0].image).toEqual(image);
		});
	});

	describe('remove image', () => {
		it('should remove image', () => {
			expect(getComic(ComicsMock[0].id)?.panels[0].image).toBeDefined();

			deletePanelImage(ComicsMock[0].id, ComicsMock[0].panels[0].id);

			expect(getComic(ComicsMock[0].id)?.panels[0].image).toBeUndefined();
		});
	});

	describe('add panel', () => {
		it('should add panel before', async () => {
			const newPanel = generateMock(PanelSchema);
			const initialLength = getComic(ComicsMock[0].id)!.panels.length;
			const panelBefore = getComic(ComicsMock[0].id)!.panels[0];
			const panelAfter = getComic(ComicsMock[0].id)!.panels[1];

			addPanel(ComicsMock[0].id, newPanel, 1);

			expect(getComic(ComicsMock[0].id)?.panels.length).toEqual(initialLength + 1);
			expect(getComic(ComicsMock[0].id)?.panels[0]).toEqual(panelBefore);
			expect(getComic(ComicsMock[0].id)?.panels[1]).toEqual(newPanel);
			expect(getComic(ComicsMock[0].id)?.panels[2]).toEqual(panelAfter);
		});
	});

	it('should remove panel', () => {
		const initialLength = getComic(ComicsMock[0].id)!.panels.length;

		expect(getComic(ComicsMock[0].id)?.panels.length).toEqual(initialLength);

		deleteType({
			type: DB_ITEM_TYPE.enum.panels,
			comicId: ComicsMock[0].id,
			panelId: ComicsMock[0].panels[0].id,
		});

		expect(getComic(ComicsMock[0].id)?.panels.length).toEqual(initialLength - 1);
	});

	describe('captions', () => {
		it('should update panel captions', () => {
			editType({
				comicId: ComicsMock[0].id,
				panelId: ComicsMock[0].panels[0].id,
				type: DB_ITEM_TYPE.enum.captions,
				index: 0,
				value: 'NEW CAPTION',
			});

			expect(getComic(ComicsMock[0].id)?.panels[0].captions[0]).toEqual('NEW CAPTION');
		});

		it('should remove field item', () => {
			const numberOfItems = getComic(ComicsMock[0].id)!.panels[0].captions.length;

			deleteType({
				type: DB_ITEM_TYPE.enum.captions,
				comicId: ComicsMock[0].id,
				panelId: ComicsMock[0].panels[0].id,
				index: 0,
			});

			expect(getComic(ComicsMock[0].id)?.panels[0].captions).toHaveLength(numberOfItems - 1);
		});
	});

	describe('dialogue', () => {
		it('should update panel dialogue', () => {
			editType({
				comicId: ComicsMock[0].id,
				panelId: ComicsMock[0].panels[0].id,
				type: DB_ITEM_TYPE.enum.dialogue,
				index: 0,
				value: 'NEW DIALOGUE',
			});

			expect(getComic(ComicsMock[0].id)?.panels[0].dialogue[0].text).toEqual('NEW DIALOGUE');
		});
	});

	describe('get charachter name', () => {
		it('should return character name', () => {
			const characterName = getCharacterName(ComicsMock[0].id, ComicsMock[0].characters[0].id);

			expect(characterName).toEqual(ComicsMock[0].characters[0].name);
		});
	});

	describe('charachter images', () => {
		it('should add charachter image from panel', () => {
			const image = generateMock(CharacterImageSchema);
			addCharacterImage(ComicsMock[0].id, ComicsMock[0].characters[0].id, image);

			const images = getCharacter(ComicsMock[0].id, ComicsMock[0].characters[0].id)!.images;

			expect(images.at(-1)).toEqual(image);
		});

		it('should remove character image', () => {
			const images = getCharacter(ComicsMock[0].id, ComicsMock[0].characters[0].id)!.images;
			const imagesLength = images.length;
			const image1Id = images[0].id;

			removeCharacterImage(ComicsMock[0].id, ComicsMock[0].characters[0].id, image1Id);

			expect(getCharacter(ComicsMock[0].id, ComicsMock[0].characters[0].id)!.images).toHaveLength(
				imagesLength - 1,
			);
			expect(
				getCharacter(ComicsMock[0].id, ComicsMock[0].characters[0].id)!.images[0].id,
			).not.toEqual(image1Id);
		});

		it('should return all panels with charachter', () => {
			const image = ComicsMock[0].panels[0].image!.portrait.characters![0];

			expect(getPanelsWithCharachter(ComicsMock[0].id, image.id)!.at(0)!.id).toEqual(
				ComicsMock[0].panels[0].id,
			);
		});
	});
});
