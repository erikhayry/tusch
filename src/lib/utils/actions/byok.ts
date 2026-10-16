import type { RequestEvent } from '@sveltejs/kit';
import z from 'zod';
import { getPingResultFromOpenAiResponse } from '../ai/ai';
import type { OpenAiOutput, Ping } from '../ai/aiTypes';
import { getCookieArgs } from '../key';
import type { ParsedValue } from './types';
import { postAiResponse } from './utils/postAiResponse';

export const ByokValuesSchema = z.object({
	key: z.string(),
});
export type ByokValues = z.infer<typeof ByokValuesSchema>;

async function getValues(formData: FormData): ParsedValue<ByokValues> {
	return ByokValuesSchema.safeParse({
		key: formData.get('key'),
	});
}

function onValues({ cookies }: RequestEvent, { key }: ByokValues) {
	cookies.set(...getCookieArgs(key));
}

function handleResponse(responseJson: OpenAiOutput): Ping {
	return getPingResultFromOpenAiResponse(responseJson);
}

export async function byok(event: RequestEvent) {
	const values = await getValues(await event.request.formData());

	return postAiResponse({ api: '/api/ai/ping', event, values, onValues, handleResponse });
}
