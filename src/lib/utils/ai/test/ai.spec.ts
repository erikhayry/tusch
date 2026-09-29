import { beforeEach, describe, expect, it, vi } from 'vitest';
import { init } from '../ai';
import { INIT, ROLE } from '../utils/messages';
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
					content: INIT.WHAT,
					role: ROLE.USER,
				},
				{
					content: source,
					role: ROLE.USER,
				},
				{
					content: INIT.HOW,
					role: ROLE.USER,
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
