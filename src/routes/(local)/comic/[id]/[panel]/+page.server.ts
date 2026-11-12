import { CREATE_PANEL_ACTION } from '$lib/features/panels/contracts/createPanel';
import { CREATE_PANEL_IMAGE_ACTION } from '$lib/features/panels/contracts/createPanelImage';
import { CLIENT_ACTION_NAME } from '$lib/forms/action-names';
import { createPanelAction, createPanelImageAction } from '$lib/server/actions/generation-actions';
import { clientCommandAction } from '$lib/server/actions/settings-actions';
import type { Actions } from './$types';

export const actions = {
	[CREATE_PANEL_ACTION]: (event) => createPanelAction(event),
	[CREATE_PANEL_IMAGE_ACTION]: (event) => createPanelImageAction(event),
	// Text edits/deletes and image removal are client commands.
	[CLIENT_ACTION_NAME]: clientCommandAction,
} satisfies Actions;
