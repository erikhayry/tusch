import { OpenRouter } from '@openrouter/sdk';
import type { ChatMessages } from '@openrouter/sdk/models';
import type { SendChatCompletionRequestResponse } from '@openrouter/sdk/models/operations';

const client = new OpenRouter({
	apiKey: '<OPENROUTER_API_KEY>',
});

function getChatMessages(messages: string[]): ChatMessages[] {
	return messages.map((message) => ({ role: 'user', content: message }));
}

export async function chat(messages: string[]): Promise<SendChatCompletionRequestResponse> {
	return client.chat.send({
		chatRequest: {
			model: 'openai/gpt-5.2',
			messages: getChatMessages(messages),
		},
	});
}
