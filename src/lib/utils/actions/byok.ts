import {
	ByokValuesSchema,
	decodeByokValues,
	type ByokValues,
} from '$lib/features/settings/contracts/validateApiKey';
import type { RequestEvent } from '@sveltejs/kit';
import { getPingResultFromOpenAiResponse } from '../ai/ai';
import type { OpenAiOutput, Ping } from '../ai/aiTypes';
import { KEY_COOKIE_NAME, getCookieArgs } from '../cookies';
import { submitAiResponse } from './utils/postAiResponse';

function onValues({ cookies }: RequestEvent, { key }: ByokValues) {
	cookies.set(...getCookieArgs(KEY_COOKIE_NAME, key));
}

function handleResponse(responseJson: OpenAiOutput): Ping {
	return getPingResultFromOpenAiResponse(responseJson);
}

export async function byok(event: RequestEvent) {
	return submitAiResponse({
		api: '/api/ai/ping',
		event,
		decode: decodeByokValues,
		schema: ByokValuesSchema,
		onValues,
		handleResponse,
	});
}
