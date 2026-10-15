import { type Comic, type ComicStyle, type Panel, type Url } from '$lib/types';
import type { Cookies } from '@sveltejs/kit';
import type { CreateCoverImageResponse } from '../../../routes/api/chat/cover-image/createCoverImageApiTypes';
import { type CreatePanelImageResponse } from '../../../routes/api/chat/panel-image/createPanelImageApiTypes';
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
	type CreatePanel,
	type InitialComic,
	type OpenAiOutput,
} from './aiTypes';
import { image, ping, text } from './sdk/openAi';
import {
	buildCoverImageMessages,
	buildInitialMessages,
	buildPanelImageMessages,
	buildPanelMessages,
} from './utils/messages';
import { IMAGE_SIZE } from './utils/settings';

function getOutputText(response: OpenAiOutput): string | undefined {
	const content = response.output.find((item) => item.type === 'message')?.content;

	return content?.find(({ type }) => type === 'output_text')?.text;
}

function parseOutputText(response: OpenAiOutput): unknown | undefined {
	const text = getOutputText(response);

	return text ? JSON.parse(text).data : undefined;
}

function getComicFromOpenAiResponse(response: OpenAiOutput): InitialComic {
	const output = parseOutputText(response);

	return InitialComicSchema.parse(output);
}

export async function initComic(
	source: Url,
	style: ComicStyle,
	cookies: Cookies,
): Promise<{ comic: Comic; output: OpenAiOutput }> {
	const response = await text(
		cookies,
		buildInitialMessages(source, style),
		SchemaName.enum.initComic,
	);
	const comic = getComicFromOpenAiResponse(response);

	return {
		comic: {
			id: generateId(),
			source,
			...comic,
			panels: comic.panels.map((initialPanel) => ({
				...initialPanel,
				id: generateId(),
			})),
		},
		output: response,
	};
}

function getImageData(response: OpenAiOutput): CreateImage {
	const output = parseOutputText(response);

	return CreateImageSchema.parse(output);
}

function getImageFromOpenAiResponse(response: OpenAiOutput): CreatedImage {
	const src = response.output.find((item) => item.type === 'image_generation_call')?.result;

	return CreatedImageSchema.parse({ src, ...getImageData(response) });
}

export async function createCoverImage({
	cookies,
	comic,
}: {
	comic: Comic;
	cookies: Cookies;
}): Promise<CreateCoverImageResponse> {
	const response = await image({
		cookies,
		messages: buildCoverImageMessages({ comic }),
		schema: SchemaName.enum.createImage,
		imageUrl: undefined,
		size: IMAGE_SIZE.PORTRAIT,
	});

	const createdImage = getImageFromOpenAiResponse(response);

	return {
		output: response,
		comicId: comic.id,
		image: {
			landscape: createdImage,
			portrait: createdImage,
		},
	};
}

export async function createPanelImage({
	panel,
	instruction,
	style,
	charactersJson,
	imageUrl,
	cookies,
}: {
	panel: Panel;
	instruction: string;
	style: ComicStyle;
	charactersJson: string;
	cookies: Cookies;
	imageUrl?: string;
}): Promise<CreatePanelImageResponse> {
	const response = await image({
		cookies,
		messages: buildPanelImageMessages({
			panel,
			charactersJson,
			instruction,
			style,
		}),
		schema: SchemaName.enum.createImage,
		imageUrl,
		size: IMAGE_SIZE.PORTRAIT,
	});
	const createdImage = getImageFromOpenAiResponse(response);

	return {
		output: response,
		image: { landscape: createdImage, portrait: createdImage },
		panelId: panel.id,
	};
}

function getPanelFromOpenAiResponse(response: OpenAiOutput): CreatePanel {
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

	const panel = getPanelFromOpenAiResponse(response);

	return { panel, output: response };
}

export async function test(cookies: Cookies): Promise<boolean> {
	const result = await ping(cookies);

	return result.status;
}
