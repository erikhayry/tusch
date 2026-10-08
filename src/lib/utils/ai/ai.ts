import { type Comic, type Panel, type Url } from '$lib/types';
import type { Cookies } from '@sveltejs/kit';
import { type CreateImageResponse } from '../../../routes/api/chat/image/createImageApiTypes';
import type { CreatePanelResponse } from '../../../routes/api/chat/panel/createPanelApiTypes';
import { generateId } from '../id';
import {
	CreatedImageSchema,
	CreateImageSchema,
	CreatePanelSchema,
	InitialComicSchema,
	SchemaName,
	type CreatedImage,
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

export async function initComic(source: Url, cookies: Cookies): Promise<Comic> {
	const response = await text(cookies, buildInitialMessages(source), SchemaName.enum.initComic);
	const comic = getComicFromOpenAiResponse(response);

	return {
		id: generateId(),
		source,
		...comic,
		panels: comic.panels.map((initialPanel) => ({
			...initialPanel,
			id: generateId(),
		})),
	};
}

function getImageData(response: OpenAiImageOutput): CreateImage {
	const output = parseOutputText(response);

	return CreateImageSchema.parse(output);
}

function getImageFromOpenAiResponse(response: OpenAiImageOutput): CreatedImage {
	const src = response.output.find((item) => item.type === 'image_generation_call')?.result;

	return CreatedImageSchema.parse({ src, ...getImageData(response) });
}

export async function createImage(panel: Panel, cookies: Cookies): Promise<CreateImageResponse> {
	const response = await image(cookies, buildImageMessages(panel), SchemaName.enum.createImage);
	const createdImage = getImageFromOpenAiResponse(response);

	return {
		image: createdImage,
		panelId: panel.id,
	};
}

function getPanelFromOpenAiResponse(response: OpenAiImageOutput): CreatePanelResponse {
	const output = parseOutputText(response);

	return CreatePanelSchema.parse(output);
}

export async function createPanel(
	index: number,
	panels: Panel[],
	cookies: Cookies,
): Promise<CreatePanelResponse> {
	const response = await text(
		cookies,
		buildPanelMessages(index, panels),
		SchemaName.enum.createPanel,
	);

	const result = getPanelFromOpenAiResponse(response);

	return result;
}
