import { CONFIG_ACTION } from '$lib/features/settings/contracts/saveModelSettings';
import { SettingsServerDataSchema } from '$lib/features/settings/contracts/settingsPage';
import { BYOK_ACTION } from '$lib/features/settings/contracts/validateApiKey';
import {
	readSelectedModels,
	saveModelSettingsAction,
	validateApiKeyAction,
} from '$lib/server/actions/settings-actions';
import type { Actions, PageServerLoad } from './$types';

// Cookies are the only persisted model authority; the API key is never returned.
export const load: PageServerLoad = ({ cookies }) =>
	SettingsServerDataSchema.parse({ config: readSelectedModels(cookies) });

export const actions = {
	[BYOK_ACTION]: validateApiKeyAction,
	[CONFIG_ACTION]: saveModelSettingsAction,
} satisfies Actions;
