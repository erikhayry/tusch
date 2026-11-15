import { CreateComicResultSchema } from '$lib/features/comics/contracts/createComic';
import {
	CreateCoverImageResultSchema,
	toCoverPrompt,
} from '$lib/features/comics/contracts/createCoverImage';
import {
	CreatePanelResultSchema,
	toCreatePanelValues,
} from '$lib/features/panels/contracts/createPanel';
import {
	CreatePanelImageResultSchema,
	toCreatePanelImageValues,
} from '$lib/features/panels/contracts/createPanelImage';
import type { Comic } from '$lib/types';
import { KEY_COOKIE_NAME } from '$lib/utils/cookies';
import { expect, test, type APIRequestContext } from '@playwright/test';
import type { z } from 'zod';
import { INVALID_TEXT, NO_IMAGE } from '../../../../tests/e2e/aiFailures';

const API_KEY = 'sk-test-generation-api-key';
const STORY = 'A lighthouse keeper discovers that the fog carries messages from the sea.';
const bearer = { authorization: `Bearer ${API_KEY}` };

type Endpoint = 'comic' | 'cover-image' | 'panel' | 'panel-image';

const post = (
	request: APIRequestContext,
	endpoint: Endpoint,
	data: unknown,
	headers: Record<string, string> = bearer,
) => request.post(`/api/generate/${endpoint}`, { data, headers });

/** A comic made the way a script would: through the API, not a bundled example. */
async function generateComic(request: APIRequestContext): Promise<Comic> {
	const response = await post(request, 'comic', { story: STORY, style: 'anime' });
	expect(response.status()).toBe(200);
	return CreateComicResultSchema.parse(await response.json()).comic;
}

/** A valid body for each endpoint, built from `comic`. */
function bodiesFor(comic: Comic): Record<Endpoint, unknown> {
	return {
		comic: { story: STORY, style: comic.style },
		'cover-image': { comic: toCoverPrompt(comic), instructions: '' },
		panel: toCreatePanelValues(comic.id, comic.panels, 1),
		'panel-image': {
			...toCreatePanelImageValues(comic.id, comic.panels[0], comic.characters, comic.style),
			instructions: '',
			referenceImages: [],
		},
	};
}

const ENDPOINTS: Endpoint[] = ['comic', 'cover-image', 'panel', 'panel-image'];

const RESULT_SCHEMAS: Record<Exclude<Endpoint, 'comic'>, z.ZodType> = {
	'cover-image': CreateCoverImageResultSchema,
	panel: CreatePanelResultSchema,
	'panel-image': CreatePanelImageResultSchema,
};

/** Failure bodies are JSON with a readable message, never HTML or the key. */
async function expectJsonFailure(
	response: Awaited<ReturnType<typeof post>>,
	status: number,
	code?: string,
) {
	expect(response.status()).toBe(status);
	expect(response.headers()['content-type']).toContain('application/json');
	const text = await response.text();
	expect(text).not.toContain(API_KEY);
	expect(text).not.toContain('Internal Error');
	const body = JSON.parse(text) as { code: string; message: string };
	expect(body.message).toBeTruthy();
	if (code) {
		expect(body.code).toBe(code);
	}
	return body;
}

test.describe('generation API', () => {
	test(
		'creates a comic with panels and a cover from a story',
		{ tag: ['@REQ-71-1'] },
		async ({ request }) => {
			const comic = await generateComic(request);
			expect(comic.panels.length).toBeGreaterThan(0);
			expect(comic.cover).toBeDefined();
		},
	);

	for (const endpoint of ['cover-image', 'panel', 'panel-image'] as const) {
		test(
			`/api/generate/${endpoint} returns its result for a generated comic`,
			{ tag: ['@REQ-71-1'] },
			async ({ request }) => {
				const comic = await generateComic(request);
				const response = await post(request, endpoint, bodiesFor(comic)[endpoint]);
				expect(response.status()).toBe(200);
				expect(RESULT_SCHEMAS[endpoint].safeParse(await response.json()).success).toBe(true);
			},
		);
	}

	test.describe('without a bearer key', () => {
		const MISSING_KEY_CASES: { name: string; headers: Record<string, string> }[] = [
			{ name: 'no Authorization header', headers: {} },
			{ name: 'a non-Bearer Authorization header', headers: { authorization: `Basic ${API_KEY}` } },
			{ name: 'only a key cookie', headers: { cookie: `${KEY_COOKIE_NAME}=${API_KEY}` } },
		];

		for (const endpoint of ENDPOINTS) {
			for (const { name, headers } of MISSING_KEY_CASES) {
				test(
					`/api/generate/${endpoint} rejects ${name}`,
					{ tag: ['@REQ-71-2'] },
					async ({ request }) => {
						const comic = await generateComic(request);
						const response = await post(request, endpoint, bodiesFor(comic)[endpoint], headers);
						await expectJsonFailure(response, 401, 'provider_auth');
					},
				);
			}
		}
	});

	test.describe('provider failures', () => {
		// Creating a comic only sends the story to the text model, so `no-image` must reach an
		// image request: the cover endpoint, with the marker in the instructions.
		const storyBody = (marker: string) => ({ story: `${STORY} ${marker}`, style: 'anime' });
		const PROVIDER_FAILURES: {
			marker: string;
			status: number;
			code?: string;
			endpoint: Endpoint;
			body: (comic: Comic, marker: string) => unknown;
		}[] = [
			{
				marker: 'mock-error:auth',
				status: 401,
				code: 'provider_auth',
				endpoint: 'comic',
				body: (_comic, marker) => storyBody(marker),
			},
			{
				marker: 'mock-error:rate-limit',
				status: 429,
				code: 'rate_limited',
				endpoint: 'comic',
				body: (_comic, marker) => storyBody(marker),
			},
			{
				marker: 'mock-error:upstream',
				status: 502,
				endpoint: 'comic',
				body: (_comic, marker) => storyBody(marker),
			},
			{
				marker: INVALID_TEXT,
				status: 502,
				code: 'invalid_ai_response',
				endpoint: 'comic',
				body: (_comic, marker) => storyBody(marker),
			},
			{
				marker: NO_IMAGE,
				status: 502,
				code: 'ai_no_image',
				endpoint: 'cover-image',
				body: (comic, marker) => ({ comic: toCoverPrompt(comic), instructions: marker }),
			},
		];

		for (const { marker, status, code, endpoint, body } of PROVIDER_FAILURES) {
			test(
				`${marker} returns JSON ${status} from /api/generate/${endpoint}`,
				{ tag: ['@REQ-71-2', '@REQ-71-3', '@REQ-029'] },
				async ({ request }) => {
					const comic = await generateComic(request);
					const response = await post(request, endpoint, body(comic, marker));
					await expectJsonFailure(response, status, code);
				},
			);
		}
	});

	test.describe('invalid input', () => {
		const INVALID_BODIES = [
			{ name: 'neither url nor story', data: '{"style":"anime"}', fieldErrors: true },
			{
				name: 'a story under 20 characters',
				data: '{"story":"too short","style":"anime"}',
				fieldErrors: true,
			},
			{ name: 'a body that is not JSON', data: 'this is not json', fieldErrors: false },
		];

		for (const { name, data, fieldErrors } of INVALID_BODIES) {
			test(`rejects ${name} with 400`, { tag: ['@REQ-71-3'] }, async ({ request }) => {
				const response = await request.post('/api/generate/comic', {
					headers: { ...bearer, 'content-type': 'application/json' },
					data,
				});
				const body = await expectJsonFailure(response, 400, 'invalid_input');
				if (fieldErrors) {
					expect(body).toHaveProperty('fieldErrors');
				}
			});
		}
	});
});
