import { ComicsMock } from '$lib/types/test/utils/mockTypes';
import { addComic, getComic, removeComic } from '$lib/utils/db/db';
import { describe, expect, it } from 'vitest';

const [Comic1, Comic2] = ComicsMock;

describe('Db', () => {
	describe('addComic', () => {
		it('should add comic', () => {
			expect(addComic(Comic1)[0].id).toEqual(Comic1.id);
		});
	});

	describe('getComic', () => {
		it('should return comic from db', () => {
			addComic(Comic1);

			expect(getComic(Comic1.id)!.id).toEqual(Comic1.id);
		});
	});

	describe('removeComic', () => {
		it('should remove comic', () => {
			addComic(Comic1);
			addComic(Comic2);

			expect(removeComic(Comic1.id)).toEqual([Comic2]);
		});
	});
});
