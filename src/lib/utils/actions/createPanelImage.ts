import { readCheckbox, readJsonField, readString } from '$lib/forms/form-data';
import {
	CharacterSchema,
	ComicStyleEnum,
	PanelSchema,
	ResponsivePanelImageSchema,
} from '$lib/types';
import type { RequestEvent } from '@sveltejs/kit';
import { z } from 'zod';
import { getImageFromOpenAiResponse } from '../ai/ai';
import {
	AiImageRequestSchema,
	OpenAiOutputSchema,
	SchemaName,
	type OpenAiOutput,
} from '../ai/aiTypes';
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
	[INCLUDE_IMAGE_VALUE_KEY]: z.boolean().optional(),
});
export type CreatePanelImageValues = z.infer<typeof CreatePanelImageValuesSchema>;

export const CreatePanelImageResultSchema = z.object({
	panelId: z.string(),
	comicId: z.string(),
	image: ResponsivePanelImageSchema,
	output: OpenAiOutputSchema.shape.output,
});
export type CreatePanelImageResult = z.infer<typeof CreatePanelImageResultSchema>;

function decodeValues(formData: FormData) {
	return {
		panel: readJsonField(formData, 'panel'),
		comicId: readString(formData, 'comicId'),
		style: readString(formData, 'style'),
		characters: readJsonField(formData, 'characters'),
		[INSTRUCTIONS_VALUE_KEY]: readString(formData, INSTRUCTIONS_VALUE_KEY),
		[IMAGE_VALUE_KEY]: readString(formData, IMAGE_VALUE_KEY),
		[INCLUDE_IMAGE_VALUE_KEY]: readCheckbox(formData, INCLUDE_IMAGE_VALUE_KEY),
	};
}

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
		decode: decodeValues,
		schema: CreatePanelImageValuesSchema,
		getBody,
		handleResponse,
	});
}
