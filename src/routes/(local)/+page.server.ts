import { BYOK_ACTION } from '$lib/features/settings/contracts/validateApiKey';
import { DELETE_ITEM_ACTION } from '$lib/features/comics/contracts/deleteItem';
import {
	clientCommandAction,
	hasStoredKey,
	validateApiKeyAction,
} from '$lib/server/actions/settings-actions';
import { ComicsServerDataSchema } from '$lib/types/routeData';
import type { Actions, PageServerLoad } from './$types';

// Only whether a key is stored: the start page's welcome section reads this flag (REQ-029).
export const load: PageServerLoad = ({ cookies }) =>
	ComicsServerDataSchema.parse({ hasKey: hasStoredKey(cookies) });

// The welcome section posts the key form here, so `/` also accepts `byok` (REQ-033).
export const actions = {
	[DELETE_ITEM_ACTION]: clientCommandAction,
	[BYOK_ACTION]: validateApiKeyAction,
} satisfies Actions;
