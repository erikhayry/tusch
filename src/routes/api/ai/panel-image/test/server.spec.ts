import { SchemaName } from '$lib/utils/ai/aiTypes';
import { IMAGE_SIZE } from '$lib/utils/ai/utils/settings';
import { describe, expect, it, vi } from 'vitest';
import { POST } from '../+server';
import { CREATE_PANEL_IMAGE_RESPONSE } from '../../../../../tests/mock/openAi/openAiResponse';
import { mockParse } from '../../test/util/mockOpenAi';
import { mockPostArgs } from '../../test/util/mockPostArgs';

vi.mock('openai', async () => {
	const { mockOpenAiFactory } = await import('../../test/util/mockOpenAi');
	return mockOpenAiFactory();
});

describe('api/ai/panel-image', () => {
	it('should return response', async () => {
		mockParse.mockResolvedValue(CREATE_PANEL_IMAGE_RESPONSE);
		const result = await POST(
			mockPostArgs({
				messages: ['test'],
				schemaName: SchemaName.enum.createImage,
				size: IMAGE_SIZE.PORTRAIT,
			}),
		);

		expect(result.status).toBe(200);

		const json = await result.json();
		expect(json).toEqual(CREATE_PANEL_IMAGE_RESPONSE);
	});

	it('should forward the reference image to the provider', async () => {
		mockParse.mockClear();
		mockParse.mockResolvedValue(CREATE_PANEL_IMAGE_RESPONSE);
		const imageUrl = 'data:image/png;base64,AAAA';

		await POST(
			mockPostArgs({
				messages: ['test'],
				schemaName: SchemaName.enum.createImage,
				size: IMAGE_SIZE.PORTRAIT,
				imageUrl,
			}),
		);

		expect(JSON.stringify(mockParse.mock.calls[0][0])).toContain(imageUrl);
	});
});
