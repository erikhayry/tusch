import { PanelsMock } from '$lib/types/test/utils/mockTypes';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createImage, initOpenAi, initOpenRouter } from '../ai';
import { InitialPanelsSchema } from '../aiTypes';
import { OPEN_AI_ROLE } from '../sdk/openAi';
import { OPEN_ROUTER_ROLE } from '../sdk/openRouter';
import { IMAGE, INIT } from '../utils/messages';
import {
	ContentJSONMock,
	mockOpenAiImageResponse,
	mockOpenAiInitResponse,
	mockOpenRouterResponse,
} from './mockAiResponse';

describe('ai', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('init', () => {
		describe('openAi', () => {
			it('should call openAi sdk with message', async () => {
				const source = 'https://sv.wikipedia.org/wiki/%C3%85dalsh%C3%A4ndelserna';
				mockSendOpenAi.mockResolvedValueOnce(mockOpenAiInitResponse);

				await initOpenAi(source);

				expect(mockSendOpenAi.mock.calls[0][0].input).toEqual([
					{
						content: INIT.WHAT,
						role: OPEN_AI_ROLE.SYSTEM,
					},
					{
						content: source,
						role: OPEN_AI_ROLE.SYSTEM,
					},
					{
						content: INIT.HOW,
						role: OPEN_AI_ROLE.SYSTEM,
					},
				]);
			});
		});

		describe('openRouter', () => {
			it('should call openRouter sdk with message', async () => {
				const source = 'https://sv.wikipedia.org/wiki/%C3%85dalsh%C3%A4ndelserna';
				mockSendOpenRouter.mockResolvedValueOnce(mockOpenRouterResponse);

				await initOpenRouter(source);

				expect(mockSendOpenRouter.mock.calls[0][0].chatRequest.messages).toEqual([
					{
						content: INIT.WHAT,
						role: OPEN_ROUTER_ROLE.USER,
					},
					{
						content: source,
						role: OPEN_ROUTER_ROLE.USER,
					},
					{
						content: INIT.HOW,
						role: OPEN_ROUTER_ROLE.USER,
					},
				]);
			});

			it('should call openRouter sdk with response format', async () => {
				const source = 'https://sv.wikipedia.org/wiki/%C3%85dalsh%C3%A4ndelserna';
				mockSendOpenRouter.mockResolvedValueOnce(mockOpenRouterResponse);

				await initOpenRouter(source);
				const schema =
					mockSendOpenRouter.mock.calls[0][0].chatRequest.responseFormat.jsonSchema.schema
						.properties.data.items;

				expect(schema).toEqual(InitialPanelsSchema.toJSONSchema().items);
			});

			it('should return comic', async () => {
				const source = 'https://sv.wikipedia.org/wiki/%C3%85dalsh%C3%A4ndelserna';
				mockSendOpenRouter.mockResolvedValueOnce(mockOpenRouterResponse);

				const {
					panels,
					id,
					source: returnedSource,
					title,
					setting,
					characters,
				} = await initOpenRouter(source);

				expect(panels).toHaveLength(ContentJSONMock.data.length);
				expect(id).toBeDefined();
				expect(returnedSource).toEqual(source);
				expect(title).toEqual('');
				expect(setting).toBeUndefined();
				expect(characters).toBeUndefined();
			});
		});
	});

	describe('create image', () => {
		it('should call openAi with correct messages', async () => {
			mockSendOpenAi.mockResolvedValueOnce(mockOpenAiImageResponse);

			await createImage('scene', PanelsMock[0]);

			expect(mockSendOpenAi.mock.calls[0][0].input).toEqual([
				{
					content: IMAGE.WHAT,
					role: OPEN_AI_ROLE.SYSTEM,
				},
				{
					content: 'scene: scene',
					role: OPEN_AI_ROLE.SYSTEM,
				},
				/*{
					content: `dialogue: ${PanelsMock[0].dialogue.join(' ')}`,
					role: OPEN_AI_ROLE.SYSTEM,
				},
				{
					content: `captions: ${PanelsMock[0].captions.join(' ')}`,
					role: OPEN_AI_ROLE.SYSTEM,
					},*/
				...IMAGE.HOWS.map((how) => ({
					content: how,
					role: OPEN_AI_ROLE.SYSTEM,
				})),
			]);
		});
	});
});

const { mockSendOpenRouter } = vi.hoisted(() => ({
	mockSendOpenRouter: vi.fn(),
}));

vi.mock('@openrouter/sdk', () => ({
	OpenRouter: class {
		chat = {
			send: mockSendOpenRouter,
		};
	},
}));

const { mockSendOpenAi } = vi.hoisted(() => ({
	mockSendOpenAi: vi.fn(),
}));

vi.mock('openai', () => {
	class MockOpenAI {
		responses = {
			parse: mockSendOpenAi,
		};
	}

	return {
		default: MockOpenAI,
		OpenAI: MockOpenAI,
	};
});
