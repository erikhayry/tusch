import { ComicStyleEnum, type ResponsiveImage } from '$lib/types';
import type { RequestEvent } from '@sveltejs/kit';
import { z } from 'zod';
import { getImageFromOpenAiResponse } from '../ai/ai';
import { SchemaName, type OpenAiOutput } from '../ai/aiTypes';
import { buildPanelImageMessages } from '../ai/utils/messages';
import { IMAGE_SIZE } from '../ai/utils/settings';
import { IMAGE_VALUE_KEY, INCLUDE_IMAGE_VALUE_KEY, INSTRUCTIONS_VALUE_KEY } from '../db/dbTypes';
import type { ActionResult } from './actions';
import type { ParsedValue } from './types';
import { postAiResponse, type ValidationResult } from './utils/postAiResponse';

export const CreatePanelImageValuesSchema = z.object({
	panelJsonString: z.string(),
	comicId: z.string(),
	style: ComicStyleEnum,
	charactersJsonString: z.string(),
	[INSTRUCTIONS_VALUE_KEY]: z.string(),
	[IMAGE_VALUE_KEY]: z.string().optional(),
	[INCLUDE_IMAGE_VALUE_KEY]: z.boolean(),
});
export type CreatePanelImageValues = z.infer<typeof CreatePanelImageValuesSchema>;

export type CreatePanelImageResult = {
	panelId: string;
	comicId: string;
	image: ResponsiveImage;
	output: unknown;
};

async function getValues(formData: FormData): ParsedValue<CreatePanelImageValues> {
	return CreatePanelImageValuesSchema.safeParse({
		panelJsonString: formData.get('panelJsonString'),
		comicId: formData.get('comicId'),
		style: formData.get('style'),
		charactersJsonString: formData.get('charactersJsonString'),
		[INSTRUCTIONS_VALUE_KEY]: formData.get(INSTRUCTIONS_VALUE_KEY),
		[INCLUDE_IMAGE_VALUE_KEY]: Boolean(formData.get(INCLUDE_IMAGE_VALUE_KEY)),
		[IMAGE_VALUE_KEY]: formData.get(IMAGE_VALUE_KEY) || undefined,
	});
}

function getBody({
	panelJsonString,
	charactersJsonString,
	instructions,
	style,
	includeImage,
	imageUrl,
}: CreatePanelImageValues) {
	const panel = JSON.parse(panelJsonString);
	const messagesJsonString = JSON.stringify(
		buildPanelImageMessages({
			panel,
			charactersJson: JSON.parse(charactersJsonString),
			instruction: instructions,
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
	{ comicId, panelJsonString }: CreatePanelImageValues,
): CreatePanelImageResult {
	const createdImage = getImageFromOpenAiResponse(responseJson);
	const serializableImage = structuredClone(createdImage);
	const panel = JSON.parse(panelJsonString);

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

export function fetchPanelImage(
	event: RequestEvent,
	values: ValidationResult<CreatePanelImageValues>,
) {
	return postAiResponse({ api: '/api/ai/panel-image', event, values, getBody, handleResponse });
}

export async function createPanelImage(event: RequestEvent): ActionResult<CreatePanelImageResult> {
	const values = await getValues(await event.request.formData());

	return fetchPanelImage(event, values);
}
