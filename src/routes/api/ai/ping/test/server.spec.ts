import { asOpenAiOutput, PING_SUCCESS } from '$lib/utils/ai/sdk/openAi';
import { describe, expect, it, vi } from 'vitest';
import { GET } from '../+server';
import { COOKIES_MOCK } from '../../test/util/mockPostArgs';

vi.mock('openai', async () => {
	const { mockOpenAiFactory } = await import('../../test/util/mockOpenAi');
	return mockOpenAiFactory();
});

describe('api/ai/comic', () => {
	it('should return response', async () => {
		const result = await GET(COOKIES_MOCK);

		expect(result.status).toBe(200);

		const json = await result.json();
		expect(json).toEqual(asOpenAiOutput(PING_SUCCESS));
	});
});
