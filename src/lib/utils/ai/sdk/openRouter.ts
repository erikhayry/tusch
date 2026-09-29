import { OpenRouter } from '@openrouter/sdk';
import type { ChatMessages, ChatResult } from '@openrouter/sdk/models';

const client = new OpenRouter({
	apiKey: import.meta.env.VITE_OPENROUTER_API_KEY,
});

function getChatMessages(messages: string[]): ChatMessages[] {
	return messages.map((message) => ({ role: 'user', content: message }));
}

export async function chat(messages: string[]): Promise<ChatResult> {
	return client.chat.send({
		chatRequest: {
			model: 'openai/gpt-5-nano',
			messages: getChatMessages(messages),
		},
	});
}
