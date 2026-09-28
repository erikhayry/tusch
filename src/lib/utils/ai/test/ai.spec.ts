import { beforeEach, describe, expect, it, vi } from 'vitest';
import { init } from '../ai';
import { aiInitialResponse } from './mockAiResponse';

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

describe('ai', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('init', () => {
		it('should call openRouter sdk with the correct arguments', async () => {
			mockSend.mockResolvedValueOnce({ id: 'gen-999', choices: [] });
			const url = 'https://sv.wikipedia.org/wiki/%C3%85dalsh%C3%A4ndelserna';

			await init(url);

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

		it('should return initial panels', async () => {
			mockSend.mockResolvedValueOnce({ id: 'gen-999', choices: [] });

			const panels = await init('https://sv.wikipedia.org/wiki/%C3%85dalsh%C3%A4ndelserna');

			expect(panels).toEqual(aiInitialResponse);
		});
	});
});
