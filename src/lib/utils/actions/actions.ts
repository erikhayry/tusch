import { CREATE_COMIC_ACTION } from '$lib/features/comics/contracts/createComic';
import { CREATE_COVER_IMAGE_ACTION } from '$lib/features/comics/contracts/createCoverImage';
import { CREATE_PANEL_ACTION } from '$lib/features/panels/contracts/createPanel';
import { CREATE_PANEL_IMAGE_ACTION } from '$lib/features/panels/contracts/createPanelImage';
import { CONFIG_ACTION, getConfigValues } from '$lib/features/settings/contracts/saveModelSettings';
import { BYOK_ACTION } from '$lib/features/settings/contracts/validateApiKey';
import { CLIENT_ACTION_NAME } from '$lib/forms/action-names';
import { FormFailureSchema } from '$lib/forms/form-failure';
import { IMAGE_MODEL_KEY, TEXT_MODEL_KEY } from '$lib/types';
import { type Action, type ActionFailure } from '@sveltejs/kit';
import { z } from 'zod';
import { getCookieArgs, IMAGE_MODEL_COOKIE_NAME, TEXT_MODEL_COOKIE_NAME } from '../cookies';
import { byok } from './byok';
import { createComic } from './createComic';
import { submitCoverImage } from './createCoverImage';
import { submitPanel } from './createPanel';
import { submitPanelImage } from './createPanelImage';

export const ACTION = {
	CLIENT: CLIENT_ACTION_NAME,
	CREATE_PANEL_IMAGE: CREATE_PANEL_IMAGE_ACTION,
	CREATE_COVER_IMAGE: CREATE_COVER_IMAGE_ACTION,
	CREATE_PANEL: CREATE_PANEL_ACTION,
	CREATE_COMIC: CREATE_COMIC_ACTION,
	BYOK: BYOK_ACTION,
	CONFIG: CONFIG_ACTION,
} as const;

export const ActionSuccessResultSchema = z.object({ success: z.literal(true) });
export type ActionSuccessResult = z.infer<typeof ActionSuccessResultSchema>;

export const ActionFailureDataSchema = FormFailureSchema;
export type ActionFailureData = z.infer<typeof ActionFailureDataSchema>;

export type ActionResult<T> = Promise<T | ActionFailure<ActionFailureData>>;
export const globalActions = {
	[ACTION.CLIENT]: async () => {
		return ActionSuccessResultSchema.parse({ success: true });
	},
	[ACTION.CONFIG]: async ({ request, cookies }) => {
		const config = getConfigValues(await request.formData());

		if (config.data?.[TEXT_MODEL_KEY]) {
			cookies.set(...getCookieArgs(TEXT_MODEL_COOKIE_NAME, config.data?.[TEXT_MODEL_KEY], false));
			cookies.set(...getCookieArgs(IMAGE_MODEL_COOKIE_NAME, config.data?.[IMAGE_MODEL_KEY], false));
		}

		return ActionSuccessResultSchema.parse({ success: true });
	},
	[ACTION.BYOK]: byok,
	[ACTION.CREATE_COMIC]: createComic,
	[ACTION.CREATE_PANEL]: submitPanel,
	[ACTION.CREATE_COVER_IMAGE]: submitCoverImage,
	[ACTION.CREATE_PANEL_IMAGE]: submitPanelImage,
} satisfies Record<string, Action>;
