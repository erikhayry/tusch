import { ComicStyleEnum, type Comic } from '$lib/types';
import type { RequestEvent } from '@sveltejs/kit';
import z from 'zod';
import { getComicFromOpenAiResponse } from '../ai/ai';
import { SchemaName, type OpenAiOutput } from '../ai/aiTypes';
import { buildInitialMessages } from '../ai/utils/messages';
import { INCLUDE_IMAGE_VALUE_KEY, INSTRUCTIONS_VALUE_KEY } from '../db/dbTypes';
import { generateId } from '../id';
import type { ActionResult } from './actions';
import { CreateCoverImageValuesSchema, fetchCoverImage } from './createCoverImage';
import type { ParsedValue } from './types';
import { postAiResponse } from './utils/postAiResponse';

export const CreateComicValuesSchema = z.object({
	url: z.url(),
	style: ComicStyleEnum,
});
export type CreateComicValues = z.infer<typeof CreateComicValuesSchema>;
export type CreateComicResult = { comic: Comic; output: unknown };

async function getValues(formData: FormData): ParsedValue<CreateComicValues> {
	return CreateComicValuesSchema.safeParse({
		url: formData.get('url'),
		style: formData.get('style'),
	});
}

function getBody({ url, style }: CreateComicValues) {
	const comicMessagesJsonString = JSON.stringify(buildInitialMessages(url, style));

	return {
		messagesJsonString: comicMessagesJsonString,
		schemaName: SchemaName.enum.initComic,
	};
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
	const values = await getValues(await event.request.formData());

	const comic = await postAiResponse({
		api: '/api/ai/comic',
		event,
		values,
		getBody,
		handleResponse,
	});
	const coverResult = await fetchCoverImage(
		event,
		CreateCoverImageValuesSchema.safeParse({
			comicJsonString: JSON.stringify(comic),
			style: comic.style,
			[INSTRUCTIONS_VALUE_KEY]: '',
			[INCLUDE_IMAGE_VALUE_KEY]: false,
		}),
	);

	return {
		comic: {
			...comic,
			cover: coverResult.image,
		},
		output: '',
	};
}
