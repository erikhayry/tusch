import { getConfigValues } from '$lib/components/forms/utils/values';
import { IMAGE_MODEL_KEY, TEXT_MODEL_KEY } from '$lib/types';
import { type Action, type ActionFailure } from '@sveltejs/kit';
import { z } from 'zod';
import { getCookieArgs, IMAGE_MODEL_COOKIE_NAME, TEXT_MODEL_COOKIE_NAME } from '../cookies';
import { byok } from './byok';
import { createComic } from './createComic';
import { submitCoverImage } from './createCoverImage';
import { submitPanel } from './createPanel';
import { submitPanelImage } from './createPanelImage';

export const ActionNameSchema = z.enum([
	'client',
	'create-panel-image',
	'create-cover-image',
	'create-panel',
	'create-comic',
	'byok',
	'config',
]);
export type ActionName = z.infer<typeof ActionNameSchema>;

export const ACTION = {
	CLIENT: ActionNameSchema.enum.client,
	CREATE_PANEL_IMAGE: ActionNameSchema.enum['create-panel-image'],
	CREATE_COVER_IMAGE: ActionNameSchema.enum['create-cover-image'],
	CREATE_PANEL: ActionNameSchema.enum['create-panel'],
	CREATE_COMIC: ActionNameSchema.enum['create-comic'],
	BYOK: ActionNameSchema.enum.byok,
	CONFIG: ActionNameSchema.enum.config,
} as const;

export const ActionSuccessResultSchema = z.object({ success: z.literal(true) });
export type ActionSuccessResult = z.infer<typeof ActionSuccessResultSchema>;

export const ActionFailureDataSchema = z.object({
	code: z.string(),
	message: z.string(),
	fieldErrors: z.record(z.string(), z.array(z.string()).optional()).optional(),
});
export type ActionFailureData = z.infer<typeof ActionFailureDataSchema>;

export type ActionResult<T> = Promise<T | ActionFailure<ActionFailureData>>;
export const globalActions = {
	[ACTION.CLIENT]: async () => {
		return ActionSuccessResultSchema.parse({ success: true });
	},
	[ACTION.CONFIG]: async ({ request, cookies }) => {
		const config = await getConfigValues(await request.formData());

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
