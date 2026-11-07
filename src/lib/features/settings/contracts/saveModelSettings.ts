import { readString } from '$lib/forms/form-data';
import { IMAGE_MODEL_KEY, TEXT_MODEL_KEY } from '$lib/types';
import { ConfigValuesSchema, type ConfigValues } from '$lib/utils/db/dbTypes';
import type { ZodSafeParseResult } from 'zod';

export const CONFIG_ACTION = 'config' as const;

export function decodeConfigValues(formData: FormData) {
	return {
		[IMAGE_MODEL_KEY]: readString(formData, IMAGE_MODEL_KEY),
		[TEXT_MODEL_KEY]: readString(formData, TEXT_MODEL_KEY),
	};
}

export function getConfigValues(formData: FormData): ZodSafeParseResult<ConfigValues> {
	return ConfigValuesSchema.safeParse(decodeConfigValues(formData));
}
