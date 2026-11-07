import {
	CreatePanelImageResultSchema,
	CreatePanelImageValuesSchema,
	decodeCreatePanelImageValues,
	type CreatePanelImageResult,
	type CreatePanelImageValues,
} from '$lib/features/panels/contracts/createPanelImage';
import type { RequestEvent } from '@sveltejs/kit';
import { getImageFromOpenAiResponse } from '../ai/ai';
import { AiImageRequestSchema, SchemaName, type OpenAiOutput } from '../ai/aiTypes';
import { buildPanelImageMessages } from '../ai/utils/messages';
import { IMAGE_SIZE } from '../ai/utils/settings';
import type { ActionResult } from './actions';
import { fetchAiResponse, submitAiResponse } from './utils/postAiResponse';

function getBody({
	panel,
	characters,
	instructions,
	style,
	includeImage,
	imageUrl,
}: CreatePanelImageValues) {
	return AiImageRequestSchema.parse({
		messages: buildPanelImageMessages({
			panel,
			characters,
			instructions,
			style,
		}),
		schemaName: SchemaName.enum.createImage,
		size: IMAGE_SIZE.PORTRAIT,
		imageUrl: includeImage ? imageUrl : undefined,
	});
}

function handleResponse(
	responseJson: OpenAiOutput,
	{ comicId, panel }: CreatePanelImageValues,
): CreatePanelImageResult {
	const createdImage = getImageFromOpenAiResponse(responseJson);
	const serializableImage = structuredClone(createdImage);

	return CreatePanelImageResultSchema.parse({
		comicId,
		panelId: panel.id,
		image: {
			landscape: serializableImage,
			portrait: serializableImage,
			alt: serializableImage.alt,
		},
		output: responseJson.output,
	});
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
		decode: decodeCreatePanelImageValues,
		schema: CreatePanelImageValuesSchema,
		getBody,
		handleResponse,
	});
}
