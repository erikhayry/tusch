import type { ResponsiveImage } from '$lib/types';
import type { RequestEvent } from '@sveltejs/kit';
import z from 'zod';
import { getImageFromOpenAiResponse } from '../ai/ai';
import { SchemaName, type OpenAiOutput } from '../ai/aiTypes';
import { buildCoverImageMessages } from '../ai/utils/messages';
import { IMAGE_SIZE } from '../ai/utils/settings';
import { IMAGE_VALUE_KEY, INCLUDE_IMAGE_VALUE_KEY, INSTRUCTIONS_VALUE_KEY } from '../db/dbTypes';
import type { ActionResult } from './actions';
import type { ParsedValue } from './types';
import { postAiResponse, type ValidationResult } from './utils/postAiResponse';

export type CreateCoverImageResult = { comicId: string; image: ResponsiveImage; output: unknown };
export const CreateCoverImageValuesSchema = z.object({
	comicJsonString: z.string(),
	[INSTRUCTIONS_VALUE_KEY]: z.string(),
	[IMAGE_VALUE_KEY]: z.string().optional(),
	[INCLUDE_IMAGE_VALUE_KEY]: z.boolean(),
});
export type CreateCoverImageValues = z.infer<typeof CreateCoverImageValuesSchema>;

async function getValues(formData: FormData): ParsedValue<CreateCoverImageValues> {
	return CreateCoverImageValuesSchema.safeParse({
		comicJsonString: formData.get('comicJsonString'),
		style: formData.get('style'),
		[INSTRUCTIONS_VALUE_KEY]: formData.get(INSTRUCTIONS_VALUE_KEY),
		[INCLUDE_IMAGE_VALUE_KEY]: Boolean(formData.get(INCLUDE_IMAGE_VALUE_KEY)),
		[IMAGE_VALUE_KEY]: formData.get(IMAGE_VALUE_KEY) || undefined,
	});
}

function getBody({
	comicJsonString,
	instructions,
	imageUrl,
	includeImage,
}: CreateCoverImageValues) {
	const comic = JSON.parse(comicJsonString);
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
	{ comicJsonString }: CreateCoverImageValues,
): CreateCoverImageResult {
	const createdImage = getImageFromOpenAiResponse(responseJson);
	const serializableImage = structuredClone(createdImage);
	const comic = JSON.parse(comicJsonString);

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

export function fetchCoverImage(
	event: RequestEvent,
	values: ValidationResult<CreateCoverImageValues>,
) {
	return postAiResponse({ api: '/api/ai/cover-image', event, values, getBody, handleResponse });
}

export async function createCoverImage(event: RequestEvent): ActionResult<CreateCoverImageResult> {
	const values = await getValues(await event.request.formData());

	return postAiResponse({ api: '/api/ai/cover-image', event, values, getBody, handleResponse });
}
