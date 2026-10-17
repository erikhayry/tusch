import { CharacterSchema, ComicStyleEnum, PanelSchema, type ResponsiveImage } from '$lib/types';
import type { RequestEvent } from '@sveltejs/kit';
import { z } from 'zod';
import { getImageFromOpenAiResponse } from '../ai/ai';
import { SchemaName, type OpenAiOutput } from '../ai/aiTypes';
import { buildPanelImageMessages } from '../ai/utils/messages';
import { IMAGE_SIZE } from '../ai/utils/settings';
import { IMAGE_VALUE_KEY, INCLUDE_IMAGE_VALUE_KEY, INSTRUCTIONS_VALUE_KEY } from '../db/dbTypes';
import type { ActionResult } from './actions';
import { fetchAiResponse, submitAiResponse } from './utils/postAiResponse';

export const CreatePanelImageValuesSchema = z.object({
	panel: PanelSchema,
	comicId: z.string(),
	style: ComicStyleEnum,
	characters: z.array(CharacterSchema),
	[INSTRUCTIONS_VALUE_KEY]: z.string(),
	[IMAGE_VALUE_KEY]: z.string().optional(),
	[INCLUDE_IMAGE_VALUE_KEY]: z.string().optional(),
});
export type CreatePanelImageValues = z.infer<typeof CreatePanelImageValuesSchema>;

export type CreatePanelImageResult = {
	panelId: string;
	comicId: string;
	image: ResponsiveImage;
	output: unknown;
};

function getBody({
	panel,
	characters,
	instructions,
	style,
	includeImage,
	imageUrl,
}: CreatePanelImageValues) {
	const messagesJsonString = JSON.stringify(
		buildPanelImageMessages({
			panel,
			characters,
			instructions,
			style,
		}),
	);

	return {
		messagesJsonString,
		schemaName: SchemaName.enum.createImage.toString(),
		size: IMAGE_SIZE.PORTRAIT,
		instructions,
		imageUrl: includeImage ? imageUrl : undefined,
	};
}

function handleResponse(
	responseJson: OpenAiOutput,
	{ comicId, panel }: CreatePanelImageValues,
): CreatePanelImageResult {
	const createdImage = getImageFromOpenAiResponse(responseJson);
	const serializableImage = structuredClone(createdImage);

	return {
		comicId,
		panelId: panel.id,
		image: {
			landscape: serializableImage,
			portrait: serializableImage,
			alt: serializableImage.alt,
		},
		output: responseJson.output,
	};
}

export function fetchPanelImage(event: RequestEvent, values: CreatePanelImageValues) {
	return fetchAiResponse({
		api: '/api/ai/panel-image',
		event,
		values,
		getBody,
		handleResponse,
	});
}

export async function submitPanelImage(event: RequestEvent): ActionResult<CreatePanelImageResult> {
	return submitAiResponse({
		api: '/api/ai/panel-image',
		event,
		schema: CreatePanelImageValuesSchema,
		getBody,
		handleResponse,
	});
}
