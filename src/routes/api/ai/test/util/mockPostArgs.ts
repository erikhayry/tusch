import type { AiRequest } from '$lib/utils/ai/aiTypes';
import type { RequestEvent } from '@sveltejs/kit';

export const COOKIES_MOCK = {
	cookies: {
		get: () => 'apiKey',
	},
} as unknown as RequestEvent;

export function mockPostArgs(body: AiRequest): RequestEvent {
	return {
		request: {
			json: async () => body,
		},
		cookies: COOKIES_MOCK.cookies,
	} as unknown as RequestEvent;
}
