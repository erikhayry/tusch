import { SettingsPageDataSchema } from '$lib/types/routeData';
import { ConfigStateSchema } from '$lib/utils/db/dbTypes';
import { z } from 'zod';

export const ConfigFormPropsSchema = z.object({
	models: SettingsPageDataSchema,
	config: ConfigStateSchema,
});

export type ConfigFormProps = z.infer<typeof ConfigFormPropsSchema>;
