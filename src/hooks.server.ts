import { building } from '$app/env';
import { getTextDirection } from '$lib/paraglide/runtime';
import { paraglideMiddleware } from '$lib/paraglide/server';
import { mockOpenRouterResponse } from '$lib/utils/ai/test/mockAiResponse';
import type { Handle, HandleFetch } from '@sveltejs/kit';

const handleParaglide: Handle = ({ event, resolve }) =>
	paraglideMiddleware(event.request, ({ request, locale }) => {
		event.request = request;

		return resolve(event, {
			transformPageChunk: ({ html }) =>
				html
					.replace('%paraglide.lang%', locale)
					.replace('%paraglide.dir%', getTextDirection(locale)),
		});
	});

export const handle: Handle = handleParaglide;

function isPlaywrightTestRequest(): boolean {
	return !building && process.env.PLAYWRIGHT_TEST === 'true';
}

const MOCK: Record<string, string> = {
	'/api/chat/init': JSON.stringify(mockOpenRouterResponse),
};

function getMockResponse(mock: string) {
	return new Response(mock, {
		status: 200,
		headers: { 'content-type': 'application/json' },
	});
}

export const handleFetch: HandleFetch = async ({ request, fetch }) => {
	if (isPlaywrightTestRequest()) {
		const url = new URL(request.url);
		const mock = MOCK[url.pathname];

		if (mock) {
			return getMockResponse(mock);
		}
	}

	return fetch(request);
};
