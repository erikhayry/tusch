import { CREATE_COVER_IMAGE_ACTION } from '$lib/features/comics/contracts/createCoverImage';
import { FIX_CHARACTER_CROP_ACTION } from '$lib/features/panels/contracts/fixCharacterCrop';
import { CLIENT_ACTION_NAME } from '$lib/forms/action-names';
import {
	createCoverImageAction,
	fixCharacterCropAction,
} from '$lib/server/actions/generation-actions';
import { clientCommandAction } from '$lib/server/actions/settings-actions';
import type { Actions } from './$types';

export const actions = {
	[CREATE_COVER_IMAGE_ACTION]: (event) => createCoverImageAction(event),
	[FIX_CHARACTER_CROP_ACTION]: (event) => fixCharacterCropAction(event),
	// Cover/comic deletion, the character-crop preview and the crop-fix undo are client commands.
	[CLIENT_ACTION_NAME]: clientCommandAction,
} satisfies Actions;
