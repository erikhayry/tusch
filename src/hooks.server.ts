import { building } from '$app/env';
import { getTextDirection } from '$lib/paraglide/runtime';
import { paraglideMiddleware } from '$lib/paraglide/server';
import { generateId } from '$lib/utils/id';
import type { Handle, HandleFetch } from '@sveltejs/kit';
import { EXAMPLES } from './examples/examples';

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
	'/api/chat/panel': JSON.stringify({
		...EXAMPLES[0].panels[0],
		id: generateId(),
	}),
	'/api/chat/init': JSON.stringify(EXAMPLES[0]),
	'/api/chat/image': JSON.stringify({
		panelId: EXAMPLES[0].panels[0].id,
		image: {
			alt: 'mock alt text',
			width: EXAMPLES[0].panels[0].image?.wide.width,
			height: EXAMPLES[0].panels[0].image?.wide.height,
			src: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
		},
	}),
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
