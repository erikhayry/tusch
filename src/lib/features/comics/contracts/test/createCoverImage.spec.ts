import { formDataOf } from '$lib/forms/test/utils/formDataOf';
import { generateMock } from '$lib/test/utils/generateMock';
import { ComicSchema } from '$lib/types';
import { describe, expect, it } from 'vitest';
import {
	CreateCoverImageValuesSchema,
	decodeCreateCoverImageValues,
	toCoverPrompt,
} from '../createCoverImage';

const comic = generateMock(ComicSchema);

function baseEntries(extra: Record<string, string> = {}) {
	return { comic: JSON.stringify(toCoverPrompt(comic)), instructions: 'a sunny street', ...extra };
}

function parse(entries: Record<string, string>) {
	return CreateCoverImageValuesSchema.safeParse(decodeCreateCoverImageValues(formDataOf(entries)));
}

describe('createCoverImage contract', () => {
	it('decodes an unchecked includeImage checkbox as false', () => {
		expect(parse(baseEntries())).toMatchObject({ success: true, data: { includeImage: false } });
	});

	it('decodes a checked includeImage checkbox as true', () => {
		expect(parse(baseEntries({ includeImage: 'on' }))).toMatchObject({
			success: true,
			data: { includeImage: true },
		});
	});

	it('keeps numeric-looking instructions as text', () => {
		expect(parse(baseEntries({ instructions: '123' }))).toMatchObject({
			success: true,
			data: { instructions: '123' },
		});
	});

	it('rejects malformed comic JSON', () => {
		expect(parse(baseEntries({ comic: '{not json' })).success).toBe(false);
	});

	it('rejects a missing instructions field', () => {
		const entries: Record<string, string> = baseEntries();
		delete entries.instructions;

		expect(parse(entries).success).toBe(false);
	});
});
