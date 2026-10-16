import { SchemaName } from '$lib/utils/ai/aiTypes';
import { describe, expect, it, vi } from 'vitest';
import { POST } from '../+server';
import { CREATE_PANEL_IMAGE_RESPONSE } from '../../../../../tests/mock/openAi/openAiResponse';
import { mockParse } from '../../test/util/mockOpenAi';
import { mockPotsArgs } from '../../test/util/mockPostArgs';

vi.mock('openai', async () => {
	const { mockOpenAiFactory } = await import('../../test/util/mockOpenAi');
	return mockOpenAiFactory();
});

describe('api/ai/panel-image', () => {
	it('should return response', async () => {
		mockParse.mockResolvedValue(CREATE_PANEL_IMAGE_RESPONSE);
		const result = await POST(mockPotsArgs('["test"]', SchemaName.enum.initComic));

		expect(result.status).toBe(200);

		const json = await result.json();
		expect(json).toEqual(CREATE_PANEL_IMAGE_RESPONSE);
	});
});
