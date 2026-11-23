import { SettingsPageDataSchema } from '#lib/types/routeData.ts';
import { ConfigStateSchema } from '#lib/utils/db/dbTypes.ts';
import { z } from 'zod';

export const ConfigFormPropsSchema = z.object({
	models: SettingsPageDataSchema,
	config: ConfigStateSchema,
	/** Without a key the model lists are empty for a reason the user can fix (REQ-234-5). */
	hasKey: z.boolean(),
});

export type ConfigFormProps = z.infer<typeof ConfigFormPropsSchema>;
