import { generateMock } from '$lib/test/utils/generateMock';
import { PanelSchema } from '$lib/types';
import { ComicsMock } from '$lib/types/test/utils/mockTypes';
import {
	addComic,
	addImage,
	addPanel,
	clearComics,
	deleteComic,
	deleteImage,
	deleteType,
	editType,
	getComic,
} from '$lib/utils/db/db';
import { beforeEach, describe, expect, it } from 'vitest';
import { DB_ITEM_TYPE } from '../dbTypes';

const [Comic1, Comic2] = ComicsMock;

describe('Db', () => {
	beforeEach(() => {
		clearComics();
		addComic(Comic1);
	});

	describe('addComic', () => {
		it('should add comic', () => {
			expect(addComic(Comic1)[0].id).toEqual(Comic1.id);
		});
	});

	describe('getComic', () => {
		it('should return comic from db', () => {
			expect(getComic(Comic1.id)!.id).toEqual(Comic1.id);
		});
	});

	describe('removeComic', () => {
		it('should remove comic', () => {
			addComic(Comic2);

			expect(deleteComic(Comic1.id)).toEqual([Comic2]);
		});
	});

	describe('addImage image', () => {
		it('should add image', () => {
			Comic1.panels[0].image = undefined;

			const image = {
				wide: { src: 'https://example.com/wide.jpg', width: 100, height: 100 },
				narrow: { src: 'https://example.com/narrow.jpg', width: 100, height: 100 },
				alt: '',
			};

			addImage(Comic1.id, Comic1.panels[0].id, image);

			expect(getComic(Comic1.id)?.panels[0].image).toEqual(image);
		});

		it('should replace image', () => {
			const image = {
				wide: { src: 'https://example.com/wide.jpg', width: 100, height: 100 },
				narrow: { src: 'https://example.com/narrow.jpg', width: 100, height: 100 },
				alt: '',
			};

			addImage(Comic1.id, Comic1.panels[0].id, image);

			expect(getComic(Comic1.id)?.panels[0].image).toEqual(image);
		});
	});

	describe('remove image', () => {
		it('should remove image', () => {
			expect(getComic(Comic1.id)?.panels[0].image).toBeDefined();

			deleteImage(Comic1.id, Comic1.panels[0].id);

			expect(getComic(Comic1.id)?.panels[0].image).toBeUndefined();
		});
	});

	describe('add panel', () => {
		it('should add panel before', async () => {
			const newPanel = generateMock(PanelSchema);
			const initialLength = getComic(Comic1.id)!.panels.length;
			const panelBefore = getComic(Comic1.id)!.panels[0];
			const panelAfter = getComic(Comic1.id)!.panels[1];

			addPanel(Comic1.id, newPanel, 1);

			expect(getComic(Comic1.id)?.panels.length).toEqual(initialLength + 1);
			expect(getComic(Comic1.id)?.panels[0]).toEqual(panelBefore);
			expect(getComic(Comic1.id)?.panels[1]).toEqual(newPanel);
			expect(getComic(Comic1.id)?.panels[2]).toEqual(panelAfter);
		});
	});

	it('should remove panel', () => {
		const initialLength = getComic(Comic1.id)!.panels.length;

		expect(getComic(Comic1.id)?.panels.length).toEqual(initialLength);

		deleteType({
			type: DB_ITEM_TYPE.enum.panels,
			comicId: Comic1.id,
			panelId: Comic1.panels[0].id,
		});

		expect(getComic(Comic1.id)?.panels.length).toEqual(initialLength - 1);
	});

	describe('captions', () => {
		it('should update panel captions', () => {
			editType({
				comicId: Comic1.id,
				panelId: Comic1.panels[0].id,
				type: DB_ITEM_TYPE.enum.captions,
				index: 0,
				value: 'NEW CAPTION',
			});

			expect(getComic(Comic1.id)?.panels[0].captions[0]).toEqual('NEW CAPTION');
		});

		it('should remove field item', () => {
			const numberOfItems = getComic(Comic1.id)!.panels[0].captions.length;

			deleteType({
				type: DB_ITEM_TYPE.enum.captions,
				comicId: Comic1.id,
				panelId: Comic1.panels[0].id,
				index: 0,
			});

			expect(getComic(Comic1.id)?.panels[0].captions).toHaveLength(numberOfItems - 1);
		});
	});

	describe('dialogue', () => {
		it('should update panel dialogue', () => {
			editType({
				comicId: Comic1.id,
				panelId: Comic1.panels[0].id,
				type: DB_ITEM_TYPE.enum.dialogue,
				index: 0,
				value: 'NEW DIALOGUE',
			});

			expect(getComic(Comic1.id)?.panels[0].dialogue[0]).toEqual('NEW DIALOGUE');
		});
	});
});
