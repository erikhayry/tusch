import {
	CreateComicResultSchema,
	CreateComicValuesSchema,
	decodeCreateComicValues,
	type CreateComicResult,
	type CreateComicValues,
} from '$lib/features/comics/contracts/createComic';
import { toCoverPrompt } from '$lib/features/comics/contracts/createCoverImage';
import type { Comic } from '$lib/types';
import type { RequestEvent } from '@sveltejs/kit';
import { getComicFromOpenAiResponse } from '../ai/ai';
import { AiTextRequestSchema, SchemaName, type OpenAiOutput } from '../ai/aiTypes';
import { buildInitialMessages } from '../ai/utils/messages';
import { INSTRUCTIONS_VALUE_KEY } from '../db/dbTypes';
import { generateId } from '../id';
import type { ActionResult } from './actions';
import { fetchCoverImage } from './createCoverImage';
import { isFormFailure, submitAiResponse } from './utils/postAiResponse';

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
		decode: decodeCreateComicValues,
		schema: CreateComicValuesSchema,
		getBody,
		handleResponse,
	});

	if (isFormFailure(comic)) return comic;

	const coverResult = await fetchCoverImage(event, {
		comic: toCoverPrompt(comic),
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
