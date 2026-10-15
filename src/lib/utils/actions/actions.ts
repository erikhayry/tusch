import {
	getByokValues,
	getCreateComicValues,
	getCreateCoverImageValues,
	getCreatePanelImageValues,
	getCreatePanelValues,
} from '$lib/components/forms/utils/values';
import type { Comic, Panel } from '$lib/types';
import { error, fail, type Action, type ActionFailure, type RequestEvent } from '@sveltejs/kit';
import type { CreateCoverImageResponse } from '../../../routes/api/chat/cover-image/createCoverImageApiTypes';
import type { CreatePanelImageResponse } from '../../../routes/api/chat/panel-image/createPanelImageApiTypes';
import type { CreatePanelResponse } from '../../../routes/api/chat/panel/createPanelApiTypes';
import { getCookieArgs } from '../key';

function getPostRequestInit(body: unknown) {
	return {
		method: 'POST',
		body: JSON.stringify(body),
		headers: {
			'Content-Type': 'application/json',
		},
	};
}

export const ACTION = {
	CLIENT: 'client',
	CREATE_PANEL_IMAGE: 'create-panel-image',
	CREATE_COVER_IMAGE: 'create-cover-image',
	CREATE_PANEL: 'create-panel',
	CREATE_COMIC: 'create-comic',
	BYOK: 'byok',
} as const;

export type CreateComicResult = { comic: Comic; output: unknown };
export type CreatePanelResult = { comicId: string; index: number; panel: Panel; output: unknown };
export type CreatePanelImageResult = CreatePanelImageResponse & { comicId: string };
export type CreateCoverImageResult = CreateCoverImageResponse;
export type ByokResult = { success: boolean };
type ActionResult<T> = Promise<T | ActionFailure<{ message: string }>>;

export const globalActions = {
	[ACTION.BYOK]: async ({ request, cookies, fetch }: RequestEvent): ActionResult<ByokResult> => {
		const result = await getByokValues(await request.formData());

		if (!result.success) {
			return error(500, result.error);
		}

		const { key } = result.data;

		cookies.set(...getCookieArgs(key));

		try {
			const response = await fetch('/api/chat/ping');
			const data: { success: boolean } = await response.json();

			return {
				success: data.success,
			};
		} catch {
			return fail(500, { message: 'Failed to set byok cookie' });
		}
	},

	[ACTION.CLIENT]: async () => {
		return {
			success: true,
		};
	},

	[ACTION.CREATE_COMIC]: async ({
		request,
		fetch,
	}: RequestEvent): ActionResult<CreateComicResult> => {
		const result = await getCreateComicValues(await request.formData());

		if (!result.success) {
			return fail(500, { message: result.error.message });
		}

		const { url, style } = result.data;

		try {
			const response = await fetch('/api/chat/init', getPostRequestInit({ url, style }));

			if (!response.ok) {
				return fail(500, { message: 'Failed to initialize comic' });
			}

			const { comic, output } = await response.json();

			return {
				comic,
				output,
			};
		} catch (e: unknown) {
			const message = e instanceof Error ? e.message : 'Unknown error occurred';
			return fail(500, { message });
		}
	},

	[ACTION.CREATE_PANEL]: async ({
		request,
		fetch,
	}: RequestEvent): ActionResult<CreatePanelResult> => {
		const result = await getCreatePanelValues(await request.formData());

		if (!result.success) {
			return error(500, result.error);
		}

		try {
			const { panelsJsonString, index, comicId } = result.data;
			const response = await fetch(
				'/api/chat/panel',
				getPostRequestInit({ panelsJsonString, index }),
			);
			const { panel, output }: CreatePanelResponse = await response.json();

			return {
				comicId,
				index,
				panel,
				output,
			};
		} catch (e: unknown) {
			return error(500, (e as Error).message);
		}
	},

	[ACTION.CREATE_COVER_IMAGE]: async ({
		request,
		fetch,
	}: RequestEvent): ActionResult<CreateCoverImageResult> => {
		const result = await getCreateCoverImageValues(await request.formData());

		if (!result.success) {
			return error(500, result.error);
		}

		const { comicJsonString, instructions, includeImage, imageUrl } = result.data;

		try {
			const response = await fetch(
				'/api/chat/cover-image',
				getPostRequestInit({
					comicJsonString,
					instructions,
					imageUrl: includeImage ? imageUrl : undefined,
				}),
			);
			return await response.json();
		} catch (e: unknown) {
			return error(500, (e as Error).message);
		}
	},

	[ACTION.CREATE_PANEL_IMAGE]: async ({
		request,
		fetch,
	}: RequestEvent): ActionResult<CreatePanelImageResult> => {
		const result = await getCreatePanelImageValues(await request.formData());

		if (!result.success) {
			return error(500, result.error);
		}

		const {
			comicId,
			panelJsonString,
			instructions,
			style,
			charactersJsonString,
			imageUrl,
			includeImage,
		} = result.data;

		try {
			const response = await fetch(
				'/api/chat/panel-image',
				getPostRequestInit({
					panelJsonString,
					instructions,
					style,
					charactersJsonString,
					imageUrl: includeImage ? imageUrl : undefined,
				}),
			);
			const { image, panelId, output }: CreatePanelImageResponse = await response.json();

			return {
				comicId,
				panelId,
				image,
				output,
			};
		} catch (e: unknown) {
			return error(500, (e as Error).message);
		}
	},
} satisfies Record<string, Action>;
