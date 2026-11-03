import { ComicSchema, ComicStyleEnum, type Comic } from '$lib/types';
import type { RequestEvent } from '@sveltejs/kit';
import z from 'zod';
import { getComicFromOpenAiResponse } from '../ai/ai';
import { AiTextRequestSchema, SchemaName, type OpenAiOutput } from '../ai/aiTypes';
import { buildInitialMessages } from '../ai/utils/messages';
import { INSTRUCTIONS_VALUE_KEY } from '../db/dbTypes';
import { generateId } from '../id';
import type { ActionResult } from './actions';
import { fetchCoverImage } from './createCoverImage';
import { submitAiResponse } from './utils/postAiResponse';

export const CreateComicValuesSchema = z.object({
	url: z.url(),
	style: ComicStyleEnum,
});
export type CreateComicValues = z.infer<typeof CreateComicValuesSchema>;
export const CreateComicResultSchema = z.object({
	comic: ComicSchema,
	output: z.string(),
});
export type CreateComicResult = z.infer<typeof CreateComicResultSchema>;

function getBody({ url, style }: CreateComicValues) {
	return AiTextRequestSchema.parse({
		messages: buildInitialMessages(url, style),
		schemaName: SchemaName.enum.initComic,
	});
}

function handleResponse(responseJson: OpenAiOutput, { url }: CreateComicValues): Comic {
	const initialComic = getComicFromOpenAiResponse(responseJson);

	return {
		id: generateId(),
		source: url,
		...initialComic,
		panels: initialComic.panels.map((initialPanel) => ({
			...initialPanel,
			id: generateId(),
		})),
	};
}

export async function createComic(event: RequestEvent): ActionResult<CreateComicResult> {
	const comic = await submitAiResponse({
		api: '/api/ai/comic',
		event,
		schema: CreateComicValuesSchema,
		getBody,
		handleResponse,
	});

	const coverResult = await fetchCoverImage(event, {
		comic,
		[INSTRUCTIONS_VALUE_KEY]: '',
	});

	return CreateComicResultSchema.parse({
		comic: {
			...comic,
			cover: coverResult.image,
		},
		output: '',
	});
}
