import OpenAI from 'openai';
import { zodTextFormat } from 'openai/helpers/zod.mjs';
import type { ResponseCreateParamsWithTools } from 'openai/lib/ResponsesParser.mjs';
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

export async function chatWithImage<T>(
	messages: string[],
	responseFormat: z.ZodType<T>,
): Promise<unknown> {
	const req: ResponseCreateParamsWithTools = {
		model: 'gpt-6-luna',
		input: getChatMessages(messages),
		tools: [
			{
				type: 'image_generation',
				model: 'gpt-image-2.5-flare',
				size: '1024x1536',
				quality: 'low',
				output_format: 'webp',
				background: 'opaque',
				moderation: 'auto',
			},
		],
		store: true,
		include: ['reasoning.encrypted_content', 'web_search_call.action.sources'],
		text: {
			format: getResponseFormat(responseFormat),
		},
	};

	return client.responses.parse(req);
}
