import { readString } from '$lib/forms/form-data';
import { IMAGE_MODEL_KEY, TEXT_MODEL_KEY } from '$lib/types';
import { ConfigStateSchema, ConfigValuesSchema } from '$lib/utils/db/dbTypes';
import { z } from 'zod';

export const CONFIG_ACTION = 'config' as const;

/** Committed settings returned after both model cookies are written. */
export const SaveModelSettingsResultSchema = z.object({
	success: z.literal(true),
	config: ConfigValuesSchema,
});
export type SaveModelSettingsResult = z.infer<typeof SaveModelSettingsResultSchema>;

/** Selected models as stored in cookies; either may be missing before the first save. */
export const SelectedModelsSchema = ConfigStateSchema;
export type SelectedModels = z.infer<typeof SelectedModelsSchema>;

export function decodeConfigValues(formData: FormData) {
	return {
		[IMAGE_MODEL_KEY]: readString(formData, IMAGE_MODEL_KEY),
		[TEXT_MODEL_KEY]: readString(formData, TEXT_MODEL_KEY),
	};
}

/** Both models are required and non-empty; a partial save is rejected. */
export const SaveModelSettingsValuesSchema = ConfigValuesSchema.extend({
	[TEXT_MODEL_KEY]: z.string().min(1),
	[IMAGE_MODEL_KEY]: z.string().min(1),
});
