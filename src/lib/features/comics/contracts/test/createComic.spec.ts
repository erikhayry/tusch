import { formDataOf } from '$lib/forms/test/utils/formDataOf';
import { describe, expect, it } from 'vitest';
import { CreateComicValuesSchema, decodeCreateComicValues } from '../createComic';

function parse(entries: Record<string, string>) {
	return CreateComicValuesSchema.safeParse(decodeCreateComicValues(formDataOf(entries)));
}

describe('createComic contract', () => {
	it('decodes a valid url and style', () => {
		expect(parse({ url: 'https://example.com/article', style: 'anime' })).toMatchObject({
			success: true,
			data: { url: 'https://example.com/article', style: 'anime' },
		});
	});

	it('rejects a missing url', () => {
		expect(parse({ style: 'anime' }).success).toBe(false);
	});

	it('rejects an unknown style', () => {
		expect(parse({ url: 'https://example.com/article', style: 'noir' }).success).toBe(false);
	});
});
