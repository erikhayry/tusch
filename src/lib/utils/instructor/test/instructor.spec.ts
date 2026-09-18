import { describe, it, expect, beforeEach } from 'vitest';
import { init } from '../instructor';
import { CharactersMock, ComicMock, SettingMock, UrlMock } from '$lib/types/test/utils/mockTypes';
import type { Comic } from '$lib/types';

describe('instructor', () => {
	describe('init', () => {
		let result: Comic;
		beforeEach(async () => {
			result = await init(UrlMock);
		});

		it('should return id', () => {
			expect(result.id).toBeDefined();
		});

		it('should return title', () => {
			expect(result.title).toEqual(ComicMock.title);
		});

		it('should return source', async () => {
			expect(result.source).toEqual(UrlMock);
		});

		it('should return characters', async () => {
			const { characters } = result;

			expect(characters.at(0)?.id).toEqual(CharactersMock.at(0)?.id);
			expect(characters.at(1)?.id).toEqual(CharactersMock.at(1)?.id);
			expect(characters.at(2)?.id).toEqual(CharactersMock.at(2)?.id);
		});

		it('should return setting', () => {
			const { setting } = result;

			expect(setting).toEqual(SettingMock);
		});

		it('should return script panels', () => {
			const { panels } = result;

			expect(panels.at(0)?.id).toEqual(ComicMock.panels.at(0)?.id);
		});
	});
});
