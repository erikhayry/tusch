import type { RequestEvent } from '@sveltejs/kit';
import z from 'zod';
import { getPingResultFromOpenAiResponse } from '../ai/ai';
import type { OpenAiOutput, Ping } from '../ai/aiTypes';
import { getCookieArgs } from '../key';
import { submitAiResponse } from './utils/postAiResponse';

export const ByokValuesSchema = z.object({
	key: z.string(),
});
export type ByokValues = z.infer<typeof ByokValuesSchema>;

function onValues({ cookies }: RequestEvent, { key }: ByokValues) {
	cookies.set(...getCookieArgs(key));
}

function handleResponse(responseJson: OpenAiOutput): Ping {
	return getPingResultFromOpenAiResponse(responseJson);
}

export async function byok(event: RequestEvent) {
	return submitAiResponse({
		api: '/api/ai/ping',
		event,
		schema: ByokValuesSchema,
		onValues,
		handleResponse,
	});
}
