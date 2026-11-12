import { CONFIG_ACTION } from '$lib/features/settings/contracts/saveModelSettings';
import { BYOK_ACTION } from '$lib/features/settings/contracts/validateApiKey';
import {
	saveModelSettingsAction,
	validateApiKeyAction,
} from '$lib/server/actions/settings-actions';
import type { Actions } from './$types';

export const actions = {
	[BYOK_ACTION]: validateApiKeyAction,
	[CONFIG_ACTION]: saveModelSettingsAction,
} satisfies Actions;
