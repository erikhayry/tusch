import { formDataOf } from '$lib/forms/test/utils/formDataOf';
import { IMAGE_MODEL_KEY, TEXT_MODEL_KEY } from '$lib/types';
import { describe, expect, it } from 'vitest';
import { getConfigValues } from '../saveModelSettings';

describe('saveModelSettings contract', () => {
	it('decodes both selected models as text', () => {
		expect(
			getConfigValues(
				formDataOf({ [TEXT_MODEL_KEY]: 'gpt-6-luna', [IMAGE_MODEL_KEY]: 'gpt-image' }),
			),
		).toMatchObject({
			success: true,
			data: { [TEXT_MODEL_KEY]: 'gpt-6-luna', [IMAGE_MODEL_KEY]: 'gpt-image' },
		});
	});

	it('rejects a submission without an image model', () => {
		expect(getConfigValues(formDataOf({ [TEXT_MODEL_KEY]: 'gpt-6-luna' })).success).toBe(false);
	});
});
