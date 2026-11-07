import { formDataOf } from '$lib/forms/test/utils/formDataOf';
import { describe, expect, it } from 'vitest';
import { getDeleteValues } from '../deleteItem';

describe('deleteItem contract', () => {
	it('decodes a caption deletion with a numeric index', () => {
		expect(
			getDeleteValues(formDataOf({ comicId: 'c1', panelId: 'p1', index: '2', type: 'captions' })),
		).toMatchObject({ success: true, data: { index: 2, type: 'captions' } });
	});

	it('accepts a panel deletion that has no index', () => {
		expect(
			getDeleteValues(formDataOf({ comicId: 'c1', panelId: 'p1', type: 'panels' })).success,
		).toBe(true);
	});

	it('rejects a caption deletion without an index', () => {
		expect(
			getDeleteValues(formDataOf({ comicId: 'c1', panelId: 'p1', type: 'captions' })).success,
		).toBe(false);
	});

	it('rejects a non-integer index', () => {
		expect(
			getDeleteValues(formDataOf({ comicId: 'c1', panelId: 'p1', index: '2.5', type: 'captions' }))
				.success,
		).toBe(false);
	});
});
