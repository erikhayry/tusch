import {
	type ConfigValues,
	ConfigValuesSchema,
	type DeleteValues,
	DeleteValuesSchema,
	type EditValues,
	EditValuesSchema,
} from '$lib/utils/db/dbTypes';
import type { ZodSafeParseResult } from 'zod';

function getIndex(formData: FormData): number {
	return Number.parseInt(formData.get('index')?.toString() ?? '');
}

export async function getEditValues(formData: FormData): Promise<ZodSafeParseResult<EditValues>> {
	return EditValuesSchema.safeParse({
		comicId: formData.get('comicId'),
		panelId: formData.get('panelId'),
		index: getIndex(formData),
		type: formData.get('type'),
		value: formData.get('value'),
	});
}

export async function getDeleteValues(
	formData: FormData,
): Promise<ZodSafeParseResult<DeleteValues>> {
	return DeleteValuesSchema.safeParse({
		comicId: formData.get('comicId'),
		panelId: formData.get('panelId'),
		index: getIndex(formData),
		type: formData.get('type'),
	});
}

export async function getConfigValues(
	formData: FormData,
): Promise<ZodSafeParseResult<ConfigValues>> {
	return ConfigValuesSchema.safeParse({
		model: formData.get('model'),
	});
}
