import { ModelSchema } from '$lib/types';
import { ConfigValuesSchema } from '$lib/utils/db/dbTypes';
import { z } from 'zod';

export const ConfigFormPropsSchema = z.object({
	models: z.array(ModelSchema),
	config: ConfigValuesSchema,
});

export type ConfigFormProps = z.infer<typeof ConfigFormPropsSchema>;
