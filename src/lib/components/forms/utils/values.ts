import { IMAGE_MODEL_KEY, TEXT_MODEL_KEY } from '$lib/types';
import { parseAsJson } from '$lib/types/utils/json';
import {
	type ConfigValues,
	ConfigValuesSchema,
	type CreateCharacterImageValue,
	CreateCharacterImageValueSchema,
	type DeleteValues,
	DeleteValuesSchema,
	type EditValues,
	EditValuesSchema,
} from '$lib/utils/db/dbTypes';
import type { ZodSafeParseResult } from 'zod';

function getIndex(formData: FormData): number {
	return Number.parseInt(formData.get('index')?.toString() ?? '');
}

export async function getCreateCharacterImageValues(
	formData: FormData,
): Promise<ZodSafeParseResult<CreateCharacterImageValue>> {
	return CreateCharacterImageValueSchema.safeParse({
		comicId: formData.get('comicId'),
		characterId: formData.get('characterId'),
		image: formData.get('image'),
		crop: parseAsJson(formData.get('crop')),
	});
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
		[IMAGE_MODEL_KEY]: formData.get(IMAGE_MODEL_KEY),
		[TEXT_MODEL_KEY]: formData.get(TEXT_MODEL_KEY),
	});
}
