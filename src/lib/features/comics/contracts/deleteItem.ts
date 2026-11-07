import { CLIENT_ACTION_NAME } from '$lib/forms/action-names';
import { readInteger, readString } from '$lib/forms/form-data';
import { DeleteValuesSchema, type DeleteValues } from '$lib/utils/db/dbTypes';
import type { ZodSafeParseResult } from 'zod';

export const DELETE_ITEM_ACTION = CLIENT_ACTION_NAME;

export function decodeDeleteValues(formData: FormData) {
	return {
		comicId: readString(formData, 'comicId'),
		panelId: readString(formData, 'panelId'),
		index: readInteger(formData, 'index'),
		type: readString(formData, 'type'),
	};
}

export function getDeleteValues(formData: FormData): ZodSafeParseResult<DeleteValues> {
	return DeleteValuesSchema.safeParse(decodeDeleteValues(formData));
}
