import { CLIENT_ACTION_NAME } from '$lib/forms/action-names';
import { readInteger, readString } from '$lib/forms/form-data';
import { EditValuesSchema, type EditValues } from '$lib/utils/db/dbTypes';
import type { ZodSafeParseResult } from 'zod';

export const EDIT_TEXT_ACTION = CLIENT_ACTION_NAME;

export function decodeEditValues(formData: FormData) {
	return {
		comicId: readString(formData, 'comicId'),
		panelId: readString(formData, 'panelId'),
		index: readInteger(formData, 'index'),
		type: readString(formData, 'type'),
		value: readString(formData, 'value'),
	};
}

export function getEditValues(formData: FormData): ZodSafeParseResult<EditValues> {
	return EditValuesSchema.safeParse(decodeEditValues(formData));
}
