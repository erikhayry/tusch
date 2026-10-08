import {
	getCreateComicValues,
	getCreateImageValues,
	getCreatePanelValues,
} from '$lib/components/forms/utils/values';
import type { Comic } from '$lib/types';
import type { CreateImageResponse } from '../../routes/api/chat/image/createImageApiTypes';
import type { CreatePanelResponse } from '../../routes/api/chat/panel/createPanelApiTypes';

export const ACTION = {
	CLIENT: 'client',
	CREATE_IMAGE: 'create-image',
	CREATE_PANEL: 'create-panel',
	CREATE_COMIC: 'create-comic',
} as const;

export const globalActions = {
	[ACTION.CLIENT]: async () => {
		return {
			success: true,
		};
	},

	[ACTION.CREATE_COMIC]: async ({
		request,
		fetch,
	}: {
		request: Request;
		fetch: typeof globalThis.fetch;
	}) => {
		const { url } = await getCreateComicValues(await request.formData());
		const response = await fetch('/api/chat/init', {
			method: 'POST',
			body: JSON.stringify({ url }),
			headers: {
				'Content-Type': 'application/json',
			},
		});
		const comic: Comic = await response.json();

		return {
			comic,
		};
	},

	[ACTION.CREATE_PANEL]: async ({
		request,
		fetch,
	}: {
		request: Request;
		fetch: typeof globalThis.fetch;
	}) => {
		const { comicId, index } = await getCreatePanelValues(await request.formData());
		const response = await fetch('/api/chat/panel', {
			method: 'POST',
			body: JSON.stringify({ comicId, index }),
			headers: {
				'Content-Type': 'application/json',
			},
		});
		const panel: CreatePanelResponse = await response.json();

		return {
			comicId,
			index,
			panel,
		};
	},

	[ACTION.CREATE_IMAGE]: async ({
		request,
		fetch,
	}: {
		request: Request;
		fetch: typeof globalThis.fetch;
	}) => {
		const { panelJsonString, comicId } = await getCreateImageValues(await request.formData());

		const response = await fetch('/api/chat/image', {
			method: 'POST',
			body: panelJsonString,
			headers: {
				'Content-Type': 'application/json',
			},
		});
		const { image, panelId }: CreateImageResponse = await response.json();

		return {
			comicId,
			panelId,
			image,
		};
	},
};
