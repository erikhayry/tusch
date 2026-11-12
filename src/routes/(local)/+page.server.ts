import { DELETE_ITEM_ACTION } from '$lib/features/comics/contracts/deleteItem';
import { clientCommandAction } from '$lib/server/actions/settings-actions';
import type { Actions } from './$types';

export const actions = {
	[DELETE_ITEM_ACTION]: clientCommandAction,
} satisfies Actions;
