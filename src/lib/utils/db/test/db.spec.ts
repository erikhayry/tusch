import { ComicsMock } from '$lib/types/test/utils/mockTypes';
import {
	addComic,
	clearComics,
	getComic,
	removeComic,
	removeFieldItem,
	removeImage,
	updateFieldItem,
} from '$lib/utils/db/db';
import { beforeEach, describe, expect, it } from 'vitest';
import { FIELD } from '../dbTypes';

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

			expect(removeComic(Comic1.id)).toEqual([Comic2]);
		});
	});

	describe('remove image', () => {
		it('should remove image', () => {
			expect(getComic(Comic1.id)?.panels[0].image).toBeDefined();

			removeImage(Comic1.id, Comic1.panels[0].id);

			expect(getComic(Comic1.id)?.panels[0].image).toBeUndefined();
		});
	});

	describe('captions', () => {
		it('should update panel captions', () => {
			updateFieldItem(Comic1.id, Comic1.panels[0].id, FIELD.enum.captions, 0, 'NEW CAPTION');

			expect(getComic(Comic1.id)?.panels[0].captions[0]).toEqual('NEW CAPTION');
		});

		it('should remove field item', () => {
			const numberOfItems = getComic(Comic1.id)!.panels[0].captions.length;

			removeFieldItem(Comic1.id, Comic1.panels[0].id, FIELD.enum.captions, 0);

			expect(getComic(Comic1.id)?.panels[0].captions).toHaveLength(numberOfItems - 1);
		});
	});

	describe('dialogue', () => {
		it('should update panel dialogue', () => {
			updateFieldItem(Comic1.id, Comic1.panels[0].id, FIELD.enum.dialogue, 0, 'NEW DIALOGUE');

			expect(getComic(Comic1.id)?.panels[0].dialogue[0]).toEqual('NEW DIALOGUE');
		});
	});
});
