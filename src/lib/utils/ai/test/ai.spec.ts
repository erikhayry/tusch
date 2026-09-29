import { beforeEach, describe, expect, it, vi } from 'vitest';
import { init } from '../ai';
import { ContentJSONMock, mockOpenRouterResponse } from './mockAiResponse';

describe('ai', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('init', () => {
		it('should call openRouter sdk with the correct arguments', async () => {
			const source = 'https://sv.wikipedia.org/wiki/%C3%85dalsh%C3%A4ndelserna';
			mockSend.mockResolvedValueOnce(mockOpenRouterResponse);

			await init(source);

			expect(mockSend.mock.calls[0][0].chatRequest.messages).toEqual([
				{
					content: 'Create a comic script from attached url and instructions',
					role: 'user',
				},
				{
					content: 'https://sv.wikipedia.org/wiki/%C3%85dalsh%C3%A4ndelserna',
					role: 'user',
				},
				{
					content: 'number of panels should be 5 to 10',
					role: 'user',
				},
			]);
		});

		it('should return comic', async () => {
			const source = 'https://sv.wikipedia.org/wiki/%C3%85dalsh%C3%A4ndelserna';
			mockSend.mockResolvedValueOnce(mockOpenRouterResponse);

			const { panels, id, source: returnedSource, title, setting, characters } = await init(source);

			expect(panels).toEqual(ContentJSONMock);
			expect(id).toBeDefined();
			expect(returnedSource).toEqual(source);
			expect(title).toEqual('');
			expect(setting).toBeUndefined();
			expect(characters).toBeUndefined();
		});
	});
});

const { mockSend } = vi.hoisted(() => ({
	mockSend: vi.fn(),
}));
vi.mock('@openrouter/sdk', () => ({
	OpenRouter: class {
		chat = {
			send: mockSend,
		};
	},
}));
