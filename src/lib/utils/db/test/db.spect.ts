import { describe, expect, it } from 'vitest';
import { getComic } from '$lib/utils/db/db';

describe('Db', () => {
	describe('getComic', () => {
		it('should return comic from db', () => {
			expect(getComic('1')).toEqual('');
		});
	});
});
