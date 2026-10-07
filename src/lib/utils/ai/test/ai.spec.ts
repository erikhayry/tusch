import { PanelsMock } from '$lib/types/test/utils/mockTypes';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createImage, createPanel, initComic } from '../ai';
import { SchemaName } from '../aiTypes';
import { IMAGE, INIT, PANEL } from '../utils/messages';
import {
	CreatePanelContentMock,
	InitialComicContentMock,
	imageDataMock,
	imageResulSrcMock,
	mockOpenAiCreatePanelResponse,
	mockOpenAiImageResponse,
	mockOpenAiInitComicResponse,
} from './mockAiResponse';

const SOURCE = 'https://sv.wikipedia.org/wiki/%C3%85dalsh%C3%A4ndelserna';

describe('ai', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('init', () => {
		it('should call sdk with message', async () => {
			mockSendOpenAi.mockResolvedValueOnce(mockOpenAiInitComicResponse);

			await initComic(SOURCE);

			expect(mockSendOpenAi.mock.calls[0][0].input[0].content).toEqual(INIT.WHAT);
		});

		it('should call sdk with text format', async () => {
			mockSendOpenAi.mockResolvedValueOnce(mockOpenAiInitComicResponse);

			await initComic(SOURCE);

			expect(getFormatNameFromCall(mockSendOpenAi.mock.calls[0][0])).toEqual(
				SchemaName.enum.initComic,
			);
		});

		it('should return comic', async () => {
			mockSendOpenAi.mockResolvedValueOnce(mockOpenAiInitComicResponse);

			const {
				panels,
				id,
				source: returnedSource,
				title,
				setting,
				characters,
			} = await initComic(SOURCE);

			expect(panels).toHaveLength(InitialComicContentMock.data.panels.length);
			expect(id).toBeDefined();
			expect(returnedSource).toEqual(SOURCE);
			expect(title).toEqual(InitialComicContentMock.data.title);
			expect(setting).toBeUndefined();
			expect(characters[0]).toEqual(InitialComicContentMock.data.characters[0]);
		});
	});

	describe('create image', () => {
		it('should call sdk with correct messages', async () => {
			mockSendOpenAi.mockResolvedValueOnce(mockOpenAiImageResponse);

			await createImage(PanelsMock[0]);

			expect(mockSendOpenAi.mock.calls[0][0].input[0].content).toEqual(IMAGE.WHAT);
		});

		it('should call sdk with text format', async () => {
			mockSendOpenAi.mockResolvedValueOnce(mockOpenAiImageResponse);

			await createImage(PanelsMock[0]);

			expect(getFormatNameFromCall(mockSendOpenAi.mock.calls[0][0])).toEqual(
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

	describe('create panel', () => {
		it('should call sdk with correct messages', async () => {
			mockSendOpenAi.mockResolvedValueOnce(mockOpenAiCreatePanelResponse);

			await createPanel(1, PanelsMock);

			expect(mockSendOpenAi.mock.calls[0][0].input[0].content).toEqual(PANEL.WHAT);
			expect(mockSendOpenAi.mock.calls[0][0].input[2].content).not.toContain('"image":');
		});

		it('should call sdk with text format', async () => {
			mockSendOpenAi.mockResolvedValueOnce(mockOpenAiCreatePanelResponse);

			await createPanel(1, PanelsMock);

			expect(getFormatNameFromCall(mockSendOpenAi.mock.calls[0][0])).toEqual(
				SchemaName.enum.createPanel,
			);
		});

		it('should return panel', async () => {
			mockSendOpenAi.mockResolvedValueOnce(mockOpenAiCreatePanelResponse);

			const panel = await createPanel(1, PanelsMock);

			expect(panel).toEqual(CreatePanelContentMock.data);
		});
	});
});

function getFormatNameFromCall(call: Parameters<typeof mockSendOpenAi>[0]) {
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
