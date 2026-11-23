import { CLIENT_ACTION_NAME } from '#lib/forms/action-names.ts';
import { readString } from '#lib/forms/form-data.ts';
import { ImageFormatEnum } from '#lib/types/index.ts';
import { IMAGE_FORMAT_VALUE_KEY } from '#lib/utils/db/dbTypes.ts';
import { z, type ZodSafeParseResult } from 'zod';

/** Client-only: the setting is saved in the browser after the no-op action succeeds. */
export const SET_IMAGE_FORMAT_ACTION = CLIENT_ACTION_NAME;

export const SetImageFormatValuesSchema = z.object({
	comicId: z.string().min(1),
	[IMAGE_FORMAT_VALUE_KEY]: ImageFormatEnum,
});
export type SetImageFormatValues = z.output<typeof SetImageFormatValuesSchema>;

export function decodeSetImageFormatValues(formData: FormData) {
	return {
		comicId: readString(formData, 'comicId'),
		[IMAGE_FORMAT_VALUE_KEY]: readString(formData, IMAGE_FORMAT_VALUE_KEY),
	};
}

export function getSetImageFormatValues(
	formData: FormData,
): ZodSafeParseResult<SetImageFormatValues> {
	return SetImageFormatValuesSchema.safeParse(decodeSetImageFormatValues(formData));
}
