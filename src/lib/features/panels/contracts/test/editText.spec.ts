import { formDataOf } from '$lib/forms/test/utils/formDataOf';
import { describe, expect, it } from 'vitest';
import { getEditValues } from '../editText';

const base = { comicId: 'c1', panelId: 'p1', index: '0', type: 'captions' };

describe('editText contract', () => {
	it('decodes a text value without JSON coercion', () => {
		expect(getEditValues(formDataOf({ ...base, value: '123' }))).toMatchObject({
			success: true,
			data: { value: '123', index: 0 },
		});
	});

	it.each(['false', 'null', '[1,2]'])('keeps the value "%s" as text', (value) => {
		expect(getEditValues(formDataOf({ ...base, value }))).toMatchObject({
			success: true,
			data: { value },
		});
	});

	it('rejects an unknown type', () => {
		expect(getEditValues(formDataOf({ ...base, type: 'panels', value: 'x' })).success).toBe(false);
	});

	it('rejects a missing value', () => {
		expect(getEditValues(formDataOf(base)).success).toBe(false);
	});
});
