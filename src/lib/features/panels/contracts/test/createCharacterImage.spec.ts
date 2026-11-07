import { formDataOf } from '$lib/forms/test/utils/formDataOf';
import { describe, expect, it } from 'vitest';
import { getCreateCharacterImageValues } from '../createCharacterImage';

const crop = { x: 1, y: 2, width: 30, height: 40 };
const base = { comicId: 'c1', characterId: 'ch1', image: 'panel.png' };

describe('createCharacterImage contract', () => {
	it('decodes a JSON crop', () => {
		expect(
			getCreateCharacterImageValues(formDataOf({ ...base, crop: JSON.stringify(crop) })),
		).toMatchObject({ success: true, data: { crop } });
	});

	it('rejects a malformed crop', () => {
		expect(getCreateCharacterImageValues(formDataOf({ ...base, crop: '{bad' })).success).toBe(
			false,
		);
	});

	it('keeps the image file name as text', () => {
		expect(
			getCreateCharacterImageValues(
				formDataOf({ ...base, image: '123', crop: JSON.stringify(crop) }),
			),
		).toMatchObject({ success: true, data: { image: '123' } });
	});
});
