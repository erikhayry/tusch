import { ComicSchema, type ResponsiveImage } from '$lib/types';
import type { RequestEvent } from '@sveltejs/kit';
import z from 'zod';
import { getImageFromOpenAiResponse } from '../ai/ai';
import { SchemaName, type OpenAiOutput } from '../ai/aiTypes';
import { buildCoverImageMessages } from '../ai/utils/messages';
import { IMAGE_SIZE } from '../ai/utils/settings';
import { IMAGE_VALUE_KEY, INCLUDE_IMAGE_VALUE_KEY, INSTRUCTIONS_VALUE_KEY } from '../db/dbTypes';
import type { ActionResult } from './actions';
import { fetchAiResponse, submitAiResponse } from './utils/postAiResponse';

export type CreateCoverImageResult = { comicId: string; image: ResponsiveImage; output: unknown };
export const CreateCoverImageValuesSchema = z.object({
	comic: ComicSchema,
	[INSTRUCTIONS_VALUE_KEY]: z.string(),
	[IMAGE_VALUE_KEY]: z.string().optional(),
	[INCLUDE_IMAGE_VALUE_KEY]: z.boolean().optional(),
});
export type CreateCoverImageValues = z.infer<typeof CreateCoverImageValuesSchema>;

function getBody({ comic, instructions, imageUrl, includeImage }: CreateCoverImageValues) {
	const messagesJsonString = JSON.stringify(buildCoverImageMessages({ comic }));

	return {
		messagesJsonString,
		schemaName: SchemaName.enum.createImage,
		size: IMAGE_SIZE.PORTRAIT,
		instructions,
		imageUrl: includeImage ? imageUrl : undefined,
	};
}

function handleResponse(
	responseJson: OpenAiOutput,
	{ comic }: CreateCoverImageValues,
): CreateCoverImageResult {
	const createdImage = getImageFromOpenAiResponse(responseJson);
	const serializableImage = structuredClone(createdImage);

	return {
		output: responseJson.output,
		comicId: comic.id,
		image: {
			landscape: serializableImage,
			portrait: serializableImage,
			alt: serializableImage.alt,
		},
	};
}

export function fetchCoverImage(event: RequestEvent, values: CreateCoverImageValues) {
	return fetchAiResponse({
		api: '/api/ai/cover-image',
		event,
		values,
		getBody,
		handleResponse,
	});
}

export async function submitCoverImage(event: RequestEvent): ActionResult<CreateCoverImageResult> {
	return submitAiResponse({
		api: '/api/ai/cover-image',
		event,
		schema: CreateCoverImageValuesSchema,
		getBody,
		handleResponse,
	});
}
