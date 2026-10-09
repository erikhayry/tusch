import {
	getByokValues,
	getCreateComicValues,
	getCreateImageValues,
	getCreatePanelValues,
} from '$lib/components/forms/utils/values';
import type { Comic } from '$lib/types';
import type { RequestEvent } from '@sveltejs/kit';
import type { CreateImageResponse } from '../../routes/api/chat/image/createImageApiTypes';
import type { CreatePanelResponse } from '../../routes/api/chat/panel/createPanelApiTypes';
import { getCookieArgs } from './key';

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

export const globalActions = {
	[ACTION.BYOK]: async ({ request, cookies }: RequestEvent) => {
		const { key } = await getByokValues(await request.formData());

		cookies.set(...getCookieArgs(key));

		return {
			success: true,
		};
	},

	[ACTION.CLIENT]: async () => {
		return {
			success: true,
		};
	},

	[ACTION.CREATE_COMIC]: async ({ request, fetch }: RequestEvent) => {
		const { url } = await getCreateComicValues(await request.formData());
		const response = await fetch('/api/chat/init', getPostRequestInit({ url }));
		const comic: Comic = await response.json();

		return {
			comic,
		};
	},

	[ACTION.CREATE_PANEL]: async ({ request, fetch }: RequestEvent) => {
		const { comicId, panelsJsonString, index } = await getCreatePanelValues(
			await request.formData(),
		);
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
	},

	[ACTION.CREATE_IMAGE]: async ({ request, fetch }: RequestEvent) => {
		const { comicId, panelJsonString, instructions } = await getCreateImageValues(
			await request.formData(),
		);
		const response = await fetch(
			'/api/chat/image',
			getPostRequestInit({ panelJsonString, instructions }),
		);
		const { image, panelId }: CreateImageResponse = await response.json();

		return {
			comicId,
			panelId,
			image,
		};
	},
};
