import {
	getByokValues,
	getCreateComicValues,
	getCreateImageValues,
	getCreatePanelValues,
} from '$lib/components/forms/utils/values';
import type { Comic } from '$lib/types';
import { error, fail, type Action, type ActionFailure, type RequestEvent } from '@sveltejs/kit';
import type { CreateImageResponse } from '../../../routes/api/chat/image/createImageApiTypes';
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
	CREATE_IMAGE: 'create-image',
	CREATE_PANEL: 'create-panel',
	CREATE_COMIC: 'create-comic',
	BYOK: 'byok',
} as const;

export type CreateComicResult = { comic: Comic };
export type CreateImageResult = CreateImageResponse & { comicId: string };
type ActionResult<T> = Promise<T | ActionFailure<{ message: string }>>;

export const globalActions = {
	[ACTION.BYOK]: async ({
		request,
		cookies,
		fetch,
	}: RequestEvent): ActionResult<{ success: boolean }> => {
		const result = await getByokValues(await request.formData());

		if (!result.success) {
			return error(500, result.error);
		}

		const { key } = result.data;

		cookies.set(...getCookieArgs(key));

		const response = await fetch('/api/chat/ping');
		const data: { success: boolean } = await response.json();

		return {
			success: data.success,
		};
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

			const comic: Comic = await response.json();

			return {
				comic,
			};
		} catch (e: unknown) {
			const message = e instanceof Error ? e.message : 'Unknown error occurred';
			return fail(500, { message });
		}
	},

	[ACTION.CREATE_PANEL]: async ({ request, fetch }: RequestEvent) => {
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
			const panel: CreatePanelResponse = await response.json();

			return {
				comicId,
				index,
				panel,
			};
		} catch (e: unknown) {
			return error(500, (e as Error).message);
		}
	},

	[ACTION.CREATE_IMAGE]: async ({
		request,
		fetch,
	}: RequestEvent): ActionResult<CreateImageResult> => {
		const result = await getCreateImageValues(await request.formData());

		if (!result.success) {
			return error(500, result.error);
		}

		const { comicId, panelJsonString, instructions, style } = result.data;

		try {
			const response = await fetch(
				'/api/chat/image',
				getPostRequestInit({ panelJsonString, instructions, style }),
			);
			const { image, panelId }: CreateImageResponse = await response.json();

			return {
				comicId,
				panelId,
				image,
			};
		} catch (e: unknown) {
			return error(500, (e as Error).message);
		}
	},
} satisfies Record<string, Action>;
