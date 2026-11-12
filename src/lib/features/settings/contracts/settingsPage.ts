import { SettingsPageDataSchema } from '$lib/types/routeData';
import { z } from 'zod';
import { SelectedModelsSchema } from './saveModelSettings';

/** Server load data for /settings: the cookie-backed selection only, never the API key. */
export const SettingsServerDataSchema = z.object({ config: SelectedModelsSchema });

/** Full /settings page data: available models plus the committed selection. */
export const SettingsRouteDataSchema = SettingsPageDataSchema.extend({
	config: SelectedModelsSchema,
});
export type SettingsRouteData = z.infer<typeof SettingsRouteDataSchema>;
