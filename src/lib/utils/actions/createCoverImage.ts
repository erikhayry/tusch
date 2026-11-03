import { ComicSchema, ResponsiveImageSchema } from '$lib/types';
import type { RequestEvent } from '@sveltejs/kit';
import z from 'zod';
import { getImageFromOpenAiResponse } from '../ai/ai';
import {
	AiImageRequestSchema,
	OpenAiOutputSchema,
	SchemaName,
	type OpenAiOutput,
} from '../ai/aiTypes';
import { buildCoverImageMessages } from '../ai/utils/messages';
import { IMAGE_SIZE } from '../ai/utils/settings';
import { IMAGE_VALUE_KEY, INCLUDE_IMAGE_VALUE_KEY, INSTRUCTIONS_VALUE_KEY } from '../db/dbTypes';
import type { ActionResult } from './actions';
import { fetchAiResponse, submitAiResponse } from './utils/postAiResponse';

export const CreateCoverImageResultSchema = z.object({
	comicId: z.string(),
	image: ResponsiveImageSchema,
	output: OpenAiOutputSchema.shape.output,
});
export type CreateCoverImageResult = z.infer<typeof CreateCoverImageResultSchema>;

export const CreateCoverImageValuesSchema = z.object({
	comic: ComicSchema,
	[INSTRUCTIONS_VALUE_KEY]: z.string(),
	[IMAGE_VALUE_KEY]: z.string().optional(),
	[INCLUDE_IMAGE_VALUE_KEY]: z.boolean().optional(),
});
export type CreateCoverImageValues = z.infer<typeof CreateCoverImageValuesSchema>;

function getBody({ comic, instructions, imageUrl, includeImage }: CreateCoverImageValues) {
	return AiImageRequestSchema.parse({
		messages: [...buildCoverImageMessages({ comic }), `USER INSTRUCTION: ${instructions}`],
		schemaName: SchemaName.enum.createImage,
		size: IMAGE_SIZE.PORTRAIT,
		imageUrl: includeImage ? imageUrl : undefined,
	});
}

function handleResponse(
	responseJson: OpenAiOutput,
	{ comic }: CreateCoverImageValues,
): CreateCoverImageResult {
	const createdImage = getImageFromOpenAiResponse(responseJson);
	const serializableImage = structuredClone(createdImage);

	return CreateCoverImageResultSchema.parse({
		output: responseJson.output,
		comicId: comic.id,
		image: {
			landscape: serializableImage,
			portrait: serializableImage,
			alt: serializableImage.alt,
		},
	});
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
