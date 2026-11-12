import { generateMocks } from '$lib/test/utils/generateMock';
import { ComicSchema } from '$lib/types';
import { describe, expect, it } from 'vitest';
import {
	COMIC_SNAPSHOT_VERSION,
	readComicSnapshot,
	serializeComicSnapshot,
} from '../comic-persistence';

const comics = generateMocks(ComicSchema, 2);

describe('comic persistence', () => {
	it('reports a missing snapshot', () => {
		expect(readComicSnapshot(null)).toEqual({ status: 'missing' });
	});

	it('reports corrupt JSON with the raw value so it can be preserved', () => {
		expect(readComicSnapshot('{not json')).toEqual({
			status: 'invalid',
			reason: 'corrupt JSON',
			raw: '{not json',
		});
	});

	it('round-trips a versioned snapshot', () => {
		const read = readComicSnapshot(serializeComicSnapshot(comics));

		expect(read).toEqual({ status: 'loaded', comics });
	});

	it('writes the current snapshot version', () => {
		expect(JSON.parse(serializeComicSnapshot(comics)).version).toBe(COMIC_SNAPSHOT_VERSION);
	});

	it('migrates the legacy [id, comic] tuple format', () => {
		const legacy = JSON.stringify(comics.map((comic) => [comic.id, comic]));

		expect(readComicSnapshot(legacy)).toEqual({ status: 'loaded', comics });
	});

	it('rejects an unsupported snapshot version', () => {
		const future = JSON.stringify({ version: 99, comics });

		expect(readComicSnapshot(future)).toMatchObject({
			status: 'invalid',
			reason: 'unsupported version 99',
		});
	});

	it('rejects a snapshot that contains invalid comic data', () => {
		const invalid = JSON.stringify({ version: COMIC_SNAPSHOT_VERSION, comics: [{ id: 'x' }] });

		expect(readComicSnapshot(invalid)).toMatchObject({
			status: 'invalid',
			reason: 'invalid comics',
		});
	});

	it('refuses to serialize comics that do not match the schema', () => {
		expect(() => serializeComicSnapshot([{ id: 'x' } as never])).toThrow();
	});
});
