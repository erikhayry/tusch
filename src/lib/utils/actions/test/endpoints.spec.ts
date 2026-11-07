import { CreateCoverImageValuesSchema } from '$lib/features/comics/contracts/createCoverImage';
import { toCreatePanelValues } from '$lib/features/panels/contracts/createPanel';
import { CreatePanelImageValuesSchema } from '$lib/features/panels/contracts/createPanelImage';
import { encodeFormValue } from '$lib/forms/form-data';
import { generateMock } from '$lib/test/utils/generateMock';
import { PanelArraySchema } from '$lib/types';
import {
	IMAGE_VALUE_KEY,
	INCLUDE_IMAGE_VALUE_KEY,
	INSTRUCTIONS_VALUE_KEY,
} from '$lib/utils/db/dbTypes';
import type { RequestEvent } from '@sveltejs/kit';
import { describe, expect, it, vi } from 'vitest';
import {
	CREATE_COMIC_RESPONSE,
	CREATE_COVER_IMAGE_RESPONSE,
	CREATE_PANEL_IMAGE_RESPONSE,
	CREATE_PANEL_RESPONSE,
} from '../../../../tests/mock/openAi/openAiResponse';
import { ACTION, globalActions } from '../actions';
import { fetchPanel } from '../createPanel';

type MockResponse = {
	ok: boolean;
	status?: number;
	text?: () => Promise<string>;
	json?: () => Promise<unknown>;
};

function okResponse(body: unknown): MockResponse {
	return { ok: true, json: async () => body };
}

function getFormData(values: Record<string, unknown>) {
	const formData = new FormData();
	Object.entries(values).forEach(([key, value]) => {
		if (value === undefined) return;
		if (key === INCLUDE_IMAGE_VALUE_KEY) {
			if (value) formData.set(key, 'on');
			return;
		}
		formData.set(key, encodeFormValue(value));
	});
	return formData;
}

function getRequestEvent(values: Record<string, unknown>, responses: Record<string, MockResponse>) {
	const fetch = vi.fn(async (url: string) => responses[url]);
	const event = {
		request: { formData: async () => getFormData(values) },
		fetch,
		cookies: { get: vi.fn(), set: vi.fn() },
	} as unknown as RequestEvent;

	return { event, fetch };
}

function getSentBody(fetch: ReturnType<typeof vi.fn>, call = 0) {
	const init = fetch.mock.calls[call][1] as { method: string; body: string };
	return { method: init.method, body: JSON.parse(init.body) as Record<string, unknown> };
}

const REFERENCE_IMAGE = 'data:image/png;base64,AAAA';

describe('action endpoints', () => {
	describe('fetchPanel', () => {
		it('posts to the panel endpoint, not the cover-image endpoint', async () => {
			const { event, fetch } = getRequestEvent(
				{},
				{ '/api/ai/panel': okResponse(CREATE_PANEL_RESPONSE) },
			);
			const panels = generateMock(PanelArraySchema);

			await fetchPanel(event, toCreatePanelValues('comic-1', panels, 2));

			expect(fetch).toHaveBeenCalledOnce();
			expect(fetch.mock.calls[0][0]).toBe('/api/ai/panel');
			const { method, body } = getSentBody(fetch);
			expect(method).toBe('POST');
			expect(body).toMatchObject({ schemaName: 'createPanel' });
			expect(body.messages).toContain('Target insertion index: 2');
		});
	});

	describe('ACTION.CREATE_PANEL', () => {
		it('posts the panel request to the panel endpoint', async () => {
			const values = toCreatePanelValues('comic-1', generateMock(PanelArraySchema), 0);
			const { event, fetch } = getRequestEvent(
				{ comicId: 'comic-1', panels: values.panels, index: 0 },
				{ '/api/ai/panel': okResponse(CREATE_PANEL_RESPONSE) },
			);

			await globalActions[ACTION.CREATE_PANEL](event);

			expect(fetch.mock.calls[0][0]).toBe('/api/ai/panel');
		});
	});

	describe('ACTION.CREATE_COVER_IMAGE', () => {
		const { comic } = generateMock(CreateCoverImageValuesSchema);
		const responses = { '/api/ai/cover-image': okResponse(CREATE_COVER_IMAGE_RESPONSE) };

		it('posts to the cover-image endpoint without a reference image when unchecked', async () => {
			const { event, fetch } = getRequestEvent(
				{ comic, [INSTRUCTIONS_VALUE_KEY]: 'a sunny street', [IMAGE_VALUE_KEY]: REFERENCE_IMAGE },
				responses,
			);

			await globalActions[ACTION.CREATE_COVER_IMAGE](event);

			expect(fetch.mock.calls[0][0]).toBe('/api/ai/cover-image');
			const { method, body } = getSentBody(fetch);
			expect(method).toBe('POST');
			expect(body).toMatchObject({ schemaName: 'createImage', size: '1024x1536' });
			expect(body.imageUrl).toBeUndefined();
		});

		it('forwards the reference image when the native checkbox is checked', async () => {
			const { event, fetch } = getRequestEvent(
				{
					comic,
					[INSTRUCTIONS_VALUE_KEY]: 'a sunny street',
					[IMAGE_VALUE_KEY]: REFERENCE_IMAGE,
					[INCLUDE_IMAGE_VALUE_KEY]: true,
				},
				responses,
			);

			const result = await globalActions[ACTION.CREATE_COVER_IMAGE](event);

			expect(result).toMatchObject({ image: expect.anything() });
			expect(getSentBody(fetch).body.imageUrl).toBe(REFERENCE_IMAGE);
		});

		it('keeps numeric-looking instructions as text', async () => {
			const { event, fetch } = getRequestEvent(
				{ comic, [INSTRUCTIONS_VALUE_KEY]: '123' },
				responses,
			);

			const result = await globalActions[ACTION.CREATE_COVER_IMAGE](event);

			expect(result).toMatchObject({ image: expect.anything() });
			expect(getSentBody(fetch).body.messages).toContain('USER INSTRUCTION: 123');
		});

		it('keeps boolean-looking and null-looking instructions as text', async () => {
			for (const text of ['false', 'null']) {
				const { event, fetch } = getRequestEvent(
					{ comic, [INSTRUCTIONS_VALUE_KEY]: text },
					responses,
				);

				await globalActions[ACTION.CREATE_COVER_IMAGE](event);

				expect(getSentBody(fetch).body.messages).toContain(`USER INSTRUCTION: ${text}`);
			}
		});
	});

	describe('ACTION.CREATE_PANEL_IMAGE', () => {
		const values = generateMock(CreatePanelImageValuesSchema);
		const responses = { '/api/ai/panel-image': okResponse(CREATE_PANEL_IMAGE_RESPONSE) };

		it('posts to the panel-image endpoint and forwards the reference image when checked', async () => {
			const { event, fetch } = getRequestEvent(
				{
					...values,
					[INSTRUCTIONS_VALUE_KEY]: 'false',
					[IMAGE_VALUE_KEY]: REFERENCE_IMAGE,
					[INCLUDE_IMAGE_VALUE_KEY]: true,
				},
				responses,
			);

			await globalActions[ACTION.CREATE_PANEL_IMAGE](event);

			expect(fetch.mock.calls[0][0]).toBe('/api/ai/panel-image');
			const { body } = getSentBody(fetch);
			expect(body.imageUrl).toBe(REFERENCE_IMAGE);
			expect(body.messages).toContain('USER INSTRUCTION: false');
		});

		it('omits the reference image when the checkbox is unchecked', async () => {
			const { event, fetch } = getRequestEvent(
				{ ...values, [INSTRUCTIONS_VALUE_KEY]: 'x', [IMAGE_VALUE_KEY]: REFERENCE_IMAGE },
				responses,
			);

			await globalActions[ACTION.CREATE_PANEL_IMAGE](event);

			expect(getSentBody(fetch).body.imageUrl).toBeUndefined();
		});
	});

	describe('ACTION.CREATE_COMIC', () => {
		it('posts to the comic endpoint, then the cover-image endpoint', async () => {
			const { event, fetch } = getRequestEvent(
				{ url: 'https://example.com/article', style: 'anime' },
				{
					'/api/ai/comic': okResponse(CREATE_COMIC_RESPONSE),
					'/api/ai/cover-image': okResponse(CREATE_COVER_IMAGE_RESPONSE),
				},
			);

			await globalActions[ACTION.CREATE_COMIC](event);

			expect(fetch.mock.calls.map(([url]) => url)).toEqual([
				'/api/ai/comic',
				'/api/ai/cover-image',
			]);
			expect(getSentBody(fetch, 0).body).toMatchObject({ schemaName: 'initComic' });
		});
	});

	describe('upstream responses', () => {
		it('throws the upstream status without parsing the body when the response is not ok', async () => {
			const json = vi.fn();
			const { event } = getRequestEvent(
				{ comicId: 'comic-1', panels: [], index: 0 },
				{
					'/api/ai/panel': {
						ok: false,
						status: 429,
						text: async () => 'rate limited',
						json,
					},
				},
			);

			await expect(globalActions[ACTION.CREATE_PANEL](event)).rejects.toMatchObject({
				status: 429,
				body: { message: 'rate limited' },
			});
			expect(json).not.toHaveBeenCalled();
		});

		it('maps a network failure to a 502', async () => {
			const event = {
				request: {
					formData: async () => getFormData({ comicId: 'comic-1', panels: [], index: 0 }),
				},
				fetch: vi.fn().mockRejectedValue(new Error('socket hang up')),
				cookies: { get: vi.fn(), set: vi.fn() },
			} as unknown as RequestEvent;

			await expect(globalActions[ACTION.CREATE_PANEL](event)).rejects.toMatchObject({
				status: 502,
				body: { message: 'socket hang up' },
			});
		});
	});
});
