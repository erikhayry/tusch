import OpenAI from 'openai';
import { zodTextFormat } from 'openai/helpers/zod.mjs';
import z from 'zod';

const client = new OpenAI({
	apiKey: import.meta.env.VITE_OPENAI_API_KEY,
});

export const OPEN_AI_ROLE = {
	USER: 'user',
	SYSTEM: 'system',
} as const;

function getChatMessages(messages: string[]) {
	return messages.map((message) => ({ content: message, role: OPEN_AI_ROLE.SYSTEM }));
}

function getResponseFormat<T>(responseFormat: z.ZodType<T>) {
	return zodTextFormat(z.object({ data: responseFormat }), 'schema');
}

export async function chat<T>(messages: string[], responseFormat: z.ZodType<T>): Promise<unknown> {
	return client.responses.parse({
		model: 'gpt-6-luna',
		input: getChatMessages(messages),
		text: {
			format: getResponseFormat(responseFormat),
		},
	});
}
