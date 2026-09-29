import { OpenRouter } from '@openrouter/sdk';
import type { ChatFormatJsonSchemaConfig, ChatMessages, ChatResult } from '@openrouter/sdk/models';
import z from 'zod';

const client = new OpenRouter({
	apiKey: import.meta.env.VITE_OPENROUTER_API_KEY,
});

function getChatMessages(messages: string[]): ChatMessages[] {
	return messages.map((message) => ({ role: 'user', content: message }));
}

function getResponseFormat<T>(responseFormat: z.ZodType<T>): ChatFormatJsonSchemaConfig {
	return {
		type: 'json_schema',
		jsonSchema: {
			name: 'schema',
			schema: z
				.object({
					data: responseFormat,
				})
				.toJSONSchema(),
			strict: true,
		},
	};
}

export async function chat<T>(
	messages: string[],
	responseFormat: z.ZodType<T>,
): Promise<ChatResult> {
	return client.chat.send({
		chatRequest: {
			model: 'openai/gpt-5-nano',
			messages: getChatMessages(messages),
			responseFormat: getResponseFormat(responseFormat),
		},
	});
}
