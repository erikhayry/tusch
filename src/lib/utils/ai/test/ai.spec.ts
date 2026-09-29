import { beforeEach, describe, expect, it, vi } from 'vitest';
import { init } from '../ai';
import { InitialPanelsSchema } from '../aiTypes';
import { INIT, ROLE } from '../utils/messages';
import { ContentJSONMock, mockOpenRouterResponse } from './mockAiResponse';

describe('ai', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('init', () => {
		it('should call openRouter sdk with message', async () => {
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

		it('should call openRouter sdk with response format', async () => {
			const source = 'https://sv.wikipedia.org/wiki/%C3%85dalsh%C3%A4ndelserna';
			mockSend.mockResolvedValueOnce(mockOpenRouterResponse);

			await init(source);
			const schema =
				mockSend.mock.calls[0][0].chatRequest.responseFormat.jsonSchema.schema.properties.data
					.items;

			expect(schema).toEqual(InitialPanelsSchema.toJSONSchema().items);
		});

		it('should return comic', async () => {
			const source = 'https://sv.wikipedia.org/wiki/%C3%85dalsh%C3%A4ndelserna';
			mockSend.mockResolvedValueOnce(mockOpenRouterResponse);

			const { panels, id, source: returnedSource, title, setting, characters } = await init(source);

			expect(panels).toHaveLength(ContentJSONMock.data.length);
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
