import { type Comic, type Panel, type Url } from '$lib/types';
import { randomUUID } from 'crypto';
import {
	CreateImageResponseSchema,
	type CreateImageResponse,
} from '../../../routes/api/chat/image/createImageApiTypes';
import type { CreatePanelResponse } from '../../../routes/api/chat/panel/createPanelApiTypes';
import {
	CreateImageSchema,
	CreatePanelSchema,
	InitialComicSchema,
	SchemaName,
	type CreateImage,
	type InitialComic,
	type OpenAiImageOutput,
} from './aiTypes';
import { image, text } from './sdk/openAi';
import { buildImageMessages, buildInitialMessages, buildPanelMessages } from './utils/messages';

function getOutputText(response: OpenAiImageOutput): string | undefined {
	const content = response.output.find((item) => item.type === 'message')?.content;

	return content?.find(({ type }) => type === 'output_text')?.text;
}

function parseOutputText(response: OpenAiImageOutput): unknown | undefined {
	const text = getOutputText(response);

	return text ? JSON.parse(text).data : undefined;
}

function getComicFromOpenAiResponse(response: OpenAiImageOutput): InitialComic {
	const output = parseOutputText(response);

	return InitialComicSchema.parse(output);
}

export async function initComic(source: Url): Promise<Comic> {
	const response = await text(buildInitialMessages(source), SchemaName.enum.initComic);
	const comic = getComicFromOpenAiResponse(response);

	return {
		id: randomUUID(),
		source,
		title: comic.title,
		panels: comic.panels.map((initialPanel) => ({
			id: randomUUID(),
			...initialPanel,
		})),
	};
}

function getImageData(response: OpenAiImageOutput): CreateImage {
	const output = parseOutputText(response);

	return CreateImageSchema.parse(output);
}

function getImageFromOpenAiResponse(response: OpenAiImageOutput): CreateImageResponse {
	const src = response.output.find((item) => item.type === 'image_generation_call')?.result;

	return CreateImageResponseSchema.parse({ src, ...getImageData(response) });
}

export async function createImage(panel: Panel): Promise<CreateImageResponse> {
	const response = await image(buildImageMessages(panel), SchemaName.enum.createImage);

	const result = getImageFromOpenAiResponse(response);

	return result;
}

function getPanelFromOpenAiResponse(response: OpenAiImageOutput): CreatePanelResponse {
	const output = parseOutputText(response);

	return CreatePanelSchema.parse(output);
}

export async function createPanel(index: number, panels: Panel[]): Promise<CreatePanelResponse> {
	const response = await text(buildPanelMessages(index, panels), SchemaName.enum.createPanel);

	const result = getPanelFromOpenAiResponse(response);

	return result;
}
