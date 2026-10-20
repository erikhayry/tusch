import { getConfigValues } from '$lib/components/forms/utils/values';
import { IMAGE_MODEL_KEY, TEXT_MODEL_KEY } from '$lib/types';
import { type Action, type ActionFailure } from '@sveltejs/kit';
import { getCookieArgs, IMAGE_MODEL_COOKIE_NAME, TEXT_MODEL_COOKIE_NAME } from '../cookies';
import { byok } from './byok';
import { createComic } from './createComic';
import { submitCoverImage } from './createCoverImage';
import { submitPanel } from './createPanel';
import { submitPanelImage } from './createPanelImage';

export const ACTION = {
	CLIENT: 'client',
	CREATE_PANEL_IMAGE: 'create-panel-image',
	CREATE_COVER_IMAGE: 'create-cover-image',
	CREATE_PANEL: 'create-panel',
	CREATE_COMIC: 'create-comic',
	BYOK: 'byok',
	CONFIG: 'config',
} as const;

export type ActionResult<T> = Promise<T | ActionFailure<{ message: string }>>;
export const globalActions = {
	[ACTION.CLIENT]: async () => {
		return {
			success: true,
		};
	},
	[ACTION.CONFIG]: async ({ request, cookies }) => {
		const config = await getConfigValues(await request.formData());

		if (config.data?.[TEXT_MODEL_KEY]) {
			cookies.set(...getCookieArgs(TEXT_MODEL_COOKIE_NAME, config.data?.[TEXT_MODEL_KEY], false));
			cookies.set(...getCookieArgs(IMAGE_MODEL_COOKIE_NAME, config.data?.[IMAGE_MODEL_KEY], false));
		}

		return {
			success: true,
		};
	},
	[ACTION.BYOK]: byok,
	[ACTION.CREATE_COMIC]: createComic,
	[ACTION.CREATE_PANEL]: submitPanel,
	[ACTION.CREATE_COVER_IMAGE]: submitCoverImage,
	[ACTION.CREATE_PANEL_IMAGE]: submitPanelImage,
} satisfies Record<string, Action>;
