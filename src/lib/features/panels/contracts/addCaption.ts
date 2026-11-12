import { CLIENT_ACTION_NAME } from '$lib/forms/action-names';
import { readString } from '$lib/forms/form-data';
import { z, type ZodSafeParseResult } from 'zod';

/** Client-only: the caption is committed in the browser after the no-op action succeeds. */
export const ADD_CAPTION_ACTION = CLIENT_ACTION_NAME;

export const CAPTION_VALUE_KEY = 'caption';

export const AddCaptionValuesSchema = z.object({
	comicId: z.string().min(1),
	panelId: z.string().min(1),
	[CAPTION_VALUE_KEY]: z.string().trim().min(1, 'Caption cannot be empty'),
});
export type AddCaptionValues = z.output<typeof AddCaptionValuesSchema>;

export function decodeAddCaptionValues(formData: FormData) {
	return {
		comicId: readString(formData, 'comicId'),
		panelId: readString(formData, 'panelId'),
		[CAPTION_VALUE_KEY]: readString(formData, CAPTION_VALUE_KEY),
	};
}

export function getAddCaptionValues(formData: FormData): ZodSafeParseResult<AddCaptionValues> {
	return AddCaptionValuesSchema.safeParse(decodeAddCaptionValues(formData));
}
