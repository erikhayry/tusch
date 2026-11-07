import {
	CreateCoverImageResultSchema,
	CreateCoverImageValuesSchema,
	decodeCreateCoverImageValues,
	type CreateCoverImageResult,
	type CreateCoverImageValues,
} from '$lib/features/comics/contracts/createCoverImage';
import { getImageFromOpenAiResponse } from '$lib/utils/ai/ai';
import { AiImageRequestSchema, SchemaName, type OpenAiOutput } from '$lib/utils/ai/aiTypes';
import { buildCoverImageMessages } from '$lib/utils/ai/utils/messages';
import { IMAGE_SIZE } from '$lib/utils/ai/utils/settings';
import { type RequestEvent } from '@sveltejs/kit';
import type { ActionResult } from './actions';
import { fetchAiResponse, submitAiResponse } from './utils/postAiResponse';

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
		decode: decodeCreateCoverImageValues,
		schema: CreateCoverImageValuesSchema,
		getBody,
		handleResponse,
	});
}
