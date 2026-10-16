import { SchemaName } from '$lib/utils/ai/aiTypes';
import { describe, expect, it, vi } from 'vitest';
import { POST } from '../+server';
import { CREATE_COMIC_RESPONSE } from '../../../../../tests/mock/openAi/openAiResponse';
import { mockParse } from '../../test/util/mockOpenAi';
import { mockPostArgs } from '../../test/util/mockPostArgs';

vi.mock('openai', async () => {
	const { mockOpenAiFactory } = await import('../../test/util/mockOpenAi');
	return mockOpenAiFactory();
});

describe('api/ai/comic', () => {
	it('should return response', async () => {
		mockParse.mockResolvedValue(CREATE_COMIC_RESPONSE);
		const result = await POST(mockPostArgs('["test"]', SchemaName.enum.initComic));

		expect(result.status).toBe(200);

		const json = await result.json();
		expect(json).toEqual(CREATE_COMIC_RESPONSE);
	});
});
