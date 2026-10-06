import { PanelsMock } from '$lib/types/test/utils/mockTypes';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createImage, initComic } from '../ai';
import { SchemaName } from '../aiTypes';
import { IMAGE, INIT } from '../utils/messages';
import { OPEN_AI_ROLE } from '../utils/settings';
import {
	ContentJSONMock,
	imageDataMock,
	imageResulSrcMock,
	mockOpenAiImageResponse,
	mockOpenAiInitResponse,
} from './mockAiResponse';

const SOURCE = 'https://sv.wikipedia.org/wiki/%C3%85dalsh%C3%A4ndelserna';

describe('ai', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('init', () => {
		it('should call sdk with message', async () => {
			mockSendOpenAi.mockResolvedValueOnce(mockOpenAiInitResponse);

			await initComic(SOURCE);

			expect(mockSendOpenAi.mock.calls[0][0].input).toEqual([
				{
					content: INIT.WHAT,
					role: OPEN_AI_ROLE.SYSTEM,
				},
				{
					content: SOURCE,
					role: OPEN_AI_ROLE.SYSTEM,
				},
				{
					content: INIT.HOW,
					role: OPEN_AI_ROLE.SYSTEM,
				},
			]);
		});

		it('should call sdk with text format', async () => {
			mockSendOpenAi.mockResolvedValueOnce(mockOpenAiInitResponse);

			await initComic(SOURCE);

			expect(getFromatNameFromCall(mockSendOpenAi.mock.calls[0][0])).toEqual(
				SchemaName.enum.initComic,
			);
		});

		it('should return comic', async () => {
			mockSendOpenAi.mockResolvedValueOnce(mockOpenAiInitResponse);

			const {
				panels,
				id,
				source: returnedSource,
				title,
				setting,
				characters,
			} = await initComic(SOURCE);

			expect(panels).toHaveLength(ContentJSONMock.data.length);
			expect(id).toBeDefined();
			expect(returnedSource).toEqual(SOURCE);
			expect(title).toEqual('');
			expect(setting).toBeUndefined();
			expect(characters).toBeUndefined();
		});
	});

	describe('create image', () => {
		it('should call sdk with correct messages', async () => {
			mockSendOpenAi.mockResolvedValueOnce(mockOpenAiImageResponse);

			await createImage(PanelsMock[0]);

			expect(mockSendOpenAi.mock.calls[0][0].input).toEqual([
				{
					content: IMAGE.WHAT,
					role: OPEN_AI_ROLE.SYSTEM,
				},
				{
					content: `visualDescription: ${PanelsMock[0].visualDescription}`,
					role: OPEN_AI_ROLE.SYSTEM,
				},
				{
					content: `dialogue: ${PanelsMock[0].dialogue.join('. ')}`,
					role: OPEN_AI_ROLE.SYSTEM,
				},
				{
					content: `captions: ${PanelsMock[0].captions.join('. ')}`,
					role: OPEN_AI_ROLE.SYSTEM,
				},
				...IMAGE.HOWS.map((how) => ({
					content: how,
					role: OPEN_AI_ROLE.SYSTEM,
				})),
			]);
		});

		it('should call sdk with text format', async () => {
			mockSendOpenAi.mockResolvedValueOnce(mockOpenAiImageResponse);

			await createImage(PanelsMock[0]);

			expect(getFromatNameFromCall(mockSendOpenAi.mock.calls[0][0])).toEqual(
				SchemaName.enum.createImage,
			);
		});

		it('should return image', async () => {
			mockSendOpenAi.mockResolvedValueOnce(mockOpenAiImageResponse);

			const { src, alt, width, height } = await createImage(PanelsMock[0]);

			expect(src).toEqual(imageResulSrcMock);
			expect(alt).toEqual(imageDataMock.alt);
			expect(width).toEqual(imageDataMock.width);
			expect(height).toEqual(imageDataMock.height);
		});
	});
});

function getFromatNameFromCall(call: Parameters<typeof mockSendOpenAi>[0]) {
	return call.text.format.name;
}

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
