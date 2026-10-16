import { building } from '$app/env';
import { getTextDirection } from '$lib/paraglide/runtime';
import { paraglideMiddleware } from '$lib/paraglide/server';
import type { Handle, HandleFetch } from '@sveltejs/kit';
import {
	CREATE_COMIC_RESPONSE,
	CREATE_COVER_IMAGE_RESPONSE,
	CREATE_PANEL_IMAGE_RESPONSE,
	CREATE_PANEL_RESPONSE,
	PING_RESPONSE,
} from './tests/mock/openAi/openAiResponse';

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
	'/api/ai/ping': JSON.stringify(PING_RESPONSE),
	'/api/ai/cover-image': JSON.stringify(CREATE_COVER_IMAGE_RESPONSE),
	'/api/ai/panel-image': JSON.stringify(CREATE_PANEL_IMAGE_RESPONSE),
	'/api/ai/panel': JSON.stringify(CREATE_PANEL_RESPONSE),
	'/api/ai/comic': JSON.stringify(CREATE_COMIC_RESPONSE),
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
