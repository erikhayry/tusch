import { IMAGE_MODEL_KEY, ModelSchema, TEXT_MODEL_KEY } from '$lib/types';
import { ConfigValuesSchema } from '$lib/utils/db/dbTypes';
import { z } from 'zod';

export const ConfigFormPropsSchema = z.object({
	models: z.object({
		[TEXT_MODEL_KEY]: z.array(ModelSchema),
		[IMAGE_MODEL_KEY]: z.array(ModelSchema),
	}),
	config: ConfigValuesSchema,
});

export type ConfigFormProps = z.infer<typeof ConfigFormPropsSchema>;
