import { CLIENT_ACTION_NAME } from '$lib/forms/action-names';
import { readJsonField, readString } from '$lib/forms/form-data';
import {
	CreateCharacterImageValueSchema,
	type CreateCharacterImageValue,
} from '$lib/utils/db/dbTypes';
import type { ZodSafeParseResult } from 'zod';

export const CREATE_CHARACTER_IMAGE_ACTION = CLIENT_ACTION_NAME;

export function decodeCreateCharacterImageValues(formData: FormData) {
	return {
		comicId: readString(formData, 'comicId'),
		characterId: readString(formData, 'characterId'),
		image: readString(formData, 'image'),
		crop: readJsonField(formData, 'crop'),
	};
}

export function getCreateCharacterImageValues(
	formData: FormData,
): ZodSafeParseResult<CreateCharacterImageValue> {
	return CreateCharacterImageValueSchema.safeParse(decodeCreateCharacterImageValues(formData));
}
