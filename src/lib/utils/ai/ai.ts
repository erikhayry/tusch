import { type Comic, type Panel, type Url } from '$lib/types';
import { randomUUID } from 'crypto';
import {
	CreateImageResponseSchema,
	type CreateImageResponse,
} from '../../../routes/api/chat/image/createImageApiTypes';
import {
	CreateImageSchema,
	InitialComicSchema,
	SchemaName,
	type CreateImage,
	type InitialComic,
	type OpenAiImageOutput,
} from './aiTypes';
import { image, text } from './sdk/openAi';
import { buildImageMessages, buildInitialMessages } from './utils/messages';

function getOutputText(response: OpenAiImageOutput): string | undefined {
	const content = response.output.find((item) => item.type === 'message')?.content;

	return content?.find(({ type }) => type === 'output_text')?.text;
}

function parseOutputText(response: OpenAiImageOutput): unknown | undefined {
	const text = getOutputText(response);

	return text ? JSON.parse(text).data : undefined;
}

function getPanelsFromOpenAiResponse(response: OpenAiImageOutput): InitialComic {
	const output = parseOutputText(response);

	return InitialComicSchema.parse(output);
}

export async function initComic(source: Url): Promise<Comic> {
	const response = await text(buildInitialMessages(source), SchemaName.enum.initComic);

	return {
		id: randomUUID(),
		source,
		title: '',
		panels: getPanelsFromOpenAiResponse(response).map((initialPanel) => ({
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
