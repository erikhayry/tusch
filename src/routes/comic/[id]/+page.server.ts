import { CREATE_COVER_IMAGE_ACTION } from '$lib/features/comics/contracts/createCoverImage';
import { CLIENT_ACTION_NAME } from '$lib/forms/action-names';
import { createCoverImageAction } from '$lib/server/actions/generation-actions';
import { clientCommandAction } from '$lib/server/actions/settings-actions';
import type { Actions } from './$types';

export const actions = {
	[CREATE_COVER_IMAGE_ACTION]: (event) => createCoverImageAction(event),
	// Cover/comic deletion and the character-crop preview are client commands.
	[CLIENT_ACTION_NAME]: clientCommandAction,
} satisfies Actions;
