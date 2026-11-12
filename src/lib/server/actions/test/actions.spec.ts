import { CREATE_COMIC_ACTION } from '$lib/features/comics/contracts/createComic';
import { CREATE_COVER_IMAGE_ACTION } from '$lib/features/comics/contracts/createCoverImage';
import { CREATE_PANEL_ACTION } from '$lib/features/panels/contracts/createPanel';
import { CREATE_PANEL_IMAGE_ACTION } from '$lib/features/panels/contracts/createPanelImage';
import { CONFIG_ACTION } from '$lib/features/settings/contracts/saveModelSettings';
import { BYOK_ACTION } from '$lib/features/settings/contracts/validateApiKey';
import { CLIENT_ACTION_NAME } from '$lib/forms/action-names';
import { encodeFormValue } from '$lib/forms/form-data';
import { IMAGE_MODEL_KEY, TEXT_MODEL_KEY } from '$lib/types';
import {
	IMAGE_MODEL_COOKIE_NAME,
	KEY_COOKIE_NAME,
	TEXT_MODEL_COOKIE_NAME,
} from '$lib/utils/cookies';
import { isHttpError, type RequestEvent } from '@sveltejs/kit';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { actions as rootActions } from '../../../../routes/+page.server';
import { actions as comicActions } from '../../../../routes/comic/[id]/+page.server';
import { actions as panelActions } from '../../../../routes/comic/[id]/[panel]/+page.server';
import { actions as createActions } from '../../../../routes/comic/create/+page.server';
import { actions as settingsActions } from '../../../../routes/settings/+page.server';
import { AiGatewayError, type AiCredentials } from '../../ai/ai-gateway';
import {
	createGenerationService,
	InvalidAiResponseError,
} from '../../generation/generation-service';
import { fakeGateway } from '../../generation/test/fake-gateway';
import { createComicAction, createPanelAction } from '../generation-actions';
import {
	readSelectedModels,
	saveModelSettingsAction,
	validateApiKeyAction,
} from '../settings-actions';

const { getAiGateway } = vi.hoisted(() => ({ getAiGateway: vi.fn() }));
vi.mock('../../ai/gateway', async (importOriginal) => ({
	...(await importOriginal<typeof import('../../ai/gateway')>()),
	getAiGateway,
}));

function requestEvent(values: Record<string, unknown>) {
	const formData = new FormData();
	for (const [key, value] of Object.entries(values)) formData.set(key, encodeFormValue(value));
	const cookies = { get: vi.fn(), set: vi.fn() };
	const fetch = vi.fn();

	return {
		event: {
			request: { formData: async () => formData },
			cookies,
			fetch,
		} as unknown as RequestEvent,
		cookies,
		fetch,
	};
}

const comicValues = { url: 'https://example.com/article', style: 'anime' };
const panelValues = { comicId: 'comic-1', panels: [], index: 0 };

function failingService(error: unknown) {
	return createGenerationService(
		fakeGateway({
			text: async () => {
				throw error;
			},
		}),
	);
}

describe('server actions', () => {
	beforeEach(() => {
		getAiGateway.mockReset();
		getAiGateway.mockReturnValue(fakeGateway());
	});

	describe('generation actions', () => {
		it('calls the generation service directly, without an internal HTTP request', async () => {
			const { event, fetch } = requestEvent(comicValues);

			const result = await createComicAction(event);

			expect(result).toMatchObject({ comic: { source: comicValues.url } });
			expect(getAiGateway).toHaveBeenCalledOnce();
			expect(fetch).not.toHaveBeenCalled();
		});

		it('returns fail(400) with field errors and never calls the provider for invalid input', async () => {
			const gateway = fakeGateway();
			getAiGateway.mockReturnValue(gateway);
			const { event } = requestEvent({ url: 'not a url' });

			const result = await createComicAction(event);

			expect(result).toMatchObject({
				status: 400,
				data: { code: 'invalid_input', fieldErrors: expect.any(Object) },
			});
			expect(gateway.text).not.toHaveBeenCalled();
		});

		it.each([
			['missing-key', 401, 'provider_auth'],
			['auth', 401, 'provider_auth'],
			['permission', 403, 'provider_permission'],
			['rate-limit', 429, 'rate_limited'],
		] as const)('maps %s provider failures to fail(%i, %s)', async (kind, status, code) => {
			const { event } = requestEvent(panelValues);
			const service = failingService(new AiGatewayError(kind, `${kind} happened`));

			expect(await createPanelAction(event, { service })).toMatchObject({
				status,
				data: { code, message: `${kind} happened` },
			});
		});

		it.each([
			['upstream failures', new AiGatewayError('upstream', 'provider exploded', 500)],
			['connection failures', new AiGatewayError('connection', 'no route')],
			['unusable responses', new InvalidAiResponseError(new Error('bad json'))],
		])('turns %s into an actionable 502', async (_, failure) => {
			const { event } = requestEvent(panelValues);

			const thrown = await createPanelAction(event, { service: failingService(failure) }).catch(
				(e) => e,
			);

			expect(isHttpError(thrown)).toBe(true);
			expect(thrown).toMatchObject({ status: 502, body: { message: failure.message } });
		});
	});

	describe('settings actions', () => {
		it('stores the key and validates it with the submitted key', async () => {
			const { event, cookies } = requestEvent({ key: 'sk-new' });

			expect(await validateApiKeyAction(event)).toEqual({ success: true, message: 'ok' });

			expect(cookies.set).toHaveBeenCalledWith(KEY_COOKIE_NAME, 'sk-new', expect.any(Object));
			const credentials: AiCredentials = getAiGateway.mock.calls[0][0];
			expect(credentials.apiKey).toBe('sk-new');
		});

		it('reports a rejected key as success: false and does not store it', async () => {
			getAiGateway.mockReturnValue(
				fakeGateway({ ping: async () => ({ success: false, message: 'rejected' }) }),
			);
			const { event, cookies } = requestEvent({ key: 'sk-bad' });

			expect(await validateApiKeyAction(event)).toEqual({ success: false, message: 'rejected' });
			expect(cookies.set).not.toHaveBeenCalled();
		});

		it('validates before storing the key', async () => {
			const order: string[] = [];
			getAiGateway.mockReturnValue(
				fakeGateway({
					ping: async () => {
						order.push('ping');
						return { success: true, message: 'ok' };
					},
				}),
			);
			const { event, cookies } = requestEvent({ key: 'sk-new' });
			cookies.set.mockImplementation(() => order.push('set'));

			await validateApiKeyAction(event);

			expect(order).toEqual(['ping', 'set']);
		});

		it('stores nothing when validation is rate limited', async () => {
			getAiGateway.mockReturnValue(
				fakeGateway({
					ping: async () => {
						throw new AiGatewayError('rate-limit', 'slow down', 429);
					},
				}),
			);
			const { event, cookies } = requestEvent({ key: 'sk-new' });

			expect(await validateApiKeyAction(event)).toMatchObject({
				status: 429,
				data: { code: 'rate_limited' },
			});
			expect(cookies.set).not.toHaveBeenCalled();
		});

		it('rejects a missing key with fail(400)', async () => {
			const { event, cookies } = requestEvent({});

			expect(await validateApiKeyAction(event)).toMatchObject({ status: 400 });
			expect(cookies.set).not.toHaveBeenCalled();
		});

		it('writes both model cookies and returns the committed settings', async () => {
			const { event, cookies } = requestEvent({
				[TEXT_MODEL_KEY]: 'text',
				[IMAGE_MODEL_KEY]: 'image',
			});

			expect(await saveModelSettingsAction(event)).toEqual({
				success: true,
				config: { [TEXT_MODEL_KEY]: 'text', [IMAGE_MODEL_KEY]: 'image' },
			});

			expect(cookies.set).toHaveBeenCalledWith(TEXT_MODEL_COOKIE_NAME, 'text', expect.any(Object));
			expect(cookies.set).toHaveBeenCalledWith(
				IMAGE_MODEL_COOKIE_NAME,
				'image',
				expect.any(Object),
			);
		});
	});

	describe('model settings validation', () => {
		it.each([
			['a missing image model', { [TEXT_MODEL_KEY]: 'text' }],
			['an empty text model', { [TEXT_MODEL_KEY]: '', [IMAGE_MODEL_KEY]: 'image' }],
		])('rejects %s with fail(400) and leaves both cookies untouched', async (_, values) => {
			const { event, cookies } = requestEvent(values);

			expect(await saveModelSettingsAction(event)).toMatchObject({
				status: 400,
				data: { code: 'invalid_input' },
			});
			expect(cookies.set).not.toHaveBeenCalled();
		});

		it('reads the selected models from cookies only', () => {
			const cookies = {
				get: vi.fn((name: string) =>
					name === TEXT_MODEL_COOKIE_NAME ? 'text' : name === KEY_COOKIE_NAME ? 'sk' : undefined,
				),
			};

			expect(readSelectedModels(cookies as never)).toEqual({ [TEXT_MODEL_KEY]: 'text' });
		});
	});

	describe('route action maps', () => {
		it.each([
			['/', rootActions, [CLIENT_ACTION_NAME]],
			['/comic/create', createActions, [CREATE_COMIC_ACTION]],
			['/comic/[id]', comicActions, [CLIENT_ACTION_NAME, CREATE_COVER_IMAGE_ACTION]],
			[
				'/comic/[id]/[panel]',
				panelActions,
				[CLIENT_ACTION_NAME, CREATE_PANEL_ACTION, CREATE_PANEL_IMAGE_ACTION],
			],
			['/settings', settingsActions, [BYOK_ACTION, CONFIG_ACTION]],
		])('%s exposes only the actions its forms use', (_, actions, expected) => {
			expect(Object.keys(actions).sort()).toEqual([...expected].sort());
		});
	});
});
