import { formDataOf } from '$lib/forms/test/utils/formDataOf';
import { describe, expect, it } from 'vitest';
import { getAddCaptionValues } from '../addCaption';

const base = { comicId: 'c1', panelId: 'p1' };

describe('addCaption contract', () => {
	it('decodes and trims the caption', () => {
		expect(getAddCaptionValues(formDataOf({ ...base, caption: '  Night falls  ' }))).toMatchObject({
			success: true,
			data: { ...base, caption: 'Night falls' },
		});
	});

	it.each(['123', 'false', 'null', '{"a":1}'])('keeps "%s" as text', (caption) => {
		expect(getAddCaptionValues(formDataOf({ ...base, caption }))).toMatchObject({
			success: true,
			data: { caption },
		});
	});

	it.each([
		['an empty caption', { ...base, caption: '' }],
		['a whitespace-only caption', { ...base, caption: '   ' }],
		['a missing caption', base],
		['a missing panel id', { comicId: 'c1', caption: 'x' }],
	])('rejects %s', (_, values) => {
		expect(getAddCaptionValues(formDataOf(values)).success).toBe(false);
	});
});
