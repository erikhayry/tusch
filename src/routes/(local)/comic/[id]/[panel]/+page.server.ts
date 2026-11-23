import { CREATE_PANEL_ACTION } from '#lib/features/panels/contracts/createPanel.ts';
import { CREATE_PANEL_IMAGE_ACTION } from '#lib/features/panels/contracts/createPanelImage.ts';
import { CLIENT_ACTION_NAME } from '#lib/forms/action-names.ts';
import {
	createPanelAction,
	createPanelImageAction,
} from '#lib/server/actions/generation-actions.ts';
import { clientCommandAction } from '#lib/server/actions/settings-actions.ts';
import type { Actions } from './$types';

export const actions = {
	[CREATE_PANEL_ACTION]: (event) => createPanelAction(event),
	[CREATE_PANEL_IMAGE_ACTION]: (event) => createPanelImageAction(event),
	// Text edits/deletes and image removal are client commands.
	[CLIENT_ACTION_NAME]: clientCommandAction,
} satisfies Actions;
