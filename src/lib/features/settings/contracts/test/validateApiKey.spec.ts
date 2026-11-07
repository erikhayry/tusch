import { formDataOf } from '$lib/forms/test/utils/formDataOf';
import { describe, expect, it } from 'vitest';
import { ByokValuesSchema, decodeByokValues } from '../validateApiKey';

describe('validateApiKey contract', () => {
	it('keeps a numeric-looking key as text', () => {
		expect(ByokValuesSchema.safeParse(decodeByokValues(formDataOf({ key: '123' })))).toMatchObject({
			success: true,
			data: { key: '123' },
		});
	});

	it('rejects a missing key', () => {
		expect(ByokValuesSchema.safeParse(decodeByokValues(new FormData())).success).toBe(false);
	});
});
