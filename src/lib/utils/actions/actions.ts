import { type Action, type ActionFailure } from '@sveltejs/kit';
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
} as const;

export type ActionResult<T> = Promise<T | ActionFailure<{ message: string }>>;
export const globalActions = {
	[ACTION.CLIENT]: async () => {
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
