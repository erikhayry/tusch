import { SettingsPageDataSchema } from '$lib/types/routeData';
import { z } from 'zod';
import { SelectedModelsSchema } from './saveModelSettings';

/**
 * Server load data for /settings: the cookie-backed selection and whether a key is stored,
 * never the API key itself.
 */
export const SettingsServerDataSchema = z.object({
	config: SelectedModelsSchema,
	hasKey: z.boolean(),
});

/** Full /settings page data: available models plus the committed selection. */
export const SettingsRouteDataSchema = SettingsPageDataSchema.extend(
	SettingsServerDataSchema.shape,
);
export type SettingsRouteData = z.infer<typeof SettingsRouteDataSchema>;
