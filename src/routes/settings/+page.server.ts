import { CONFIG_ACTION } from '#lib/features/settings/contracts/saveModelSettings.ts';
import { SettingsServerDataSchema } from '#lib/features/settings/contracts/settingsPage.ts';
import { BYOK_ACTION } from '#lib/features/settings/contracts/validateApiKey.ts';
import {
	hasStoredKey,
	readSelectedModels,
	saveModelSettingsAction,
	validateApiKeyAction,
} from '#lib/server/actions/settings-actions.ts';
import type { Actions, PageServerLoad } from './$types';

// Cookies are the only persisted model authority; the API key is never returned.
export const load: PageServerLoad = ({ cookies }) =>
	SettingsServerDataSchema.parse({
		config: readSelectedModels(cookies),
		hasKey: hasStoredKey(cookies),
	});

export const actions = {
	[BYOK_ACTION]: validateApiKeyAction,
	[CONFIG_ACTION]: saveModelSettingsAction,
} satisfies Actions;
