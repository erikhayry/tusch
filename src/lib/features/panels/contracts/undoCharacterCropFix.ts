import { readString } from '$lib/forms/form-data';
import z, { type ZodSafeParseResult } from 'zod';

/** Client-only: the previous crops are restored in the browser after the no-op action succeeds. */
export { CLIENT_ACTION_NAME as UNDO_CHARACTER_CROP_FIX_ACTION } from '$lib/forms/action-names';

export const UndoCharacterCropFixValuesSchema = z.object({
	comicId: z.string().min(1),
	characterId: z.string().min(1),
	characterImageId: z.string().min(1),
});
export type UndoCharacterCropFixValues = z.output<typeof UndoCharacterCropFixValuesSchema>;

export function decodeUndoCharacterCropFixValues(formData: FormData) {
	return {
		comicId: readString(formData, 'comicId'),
		characterId: readString(formData, 'characterId'),
		characterImageId: readString(formData, 'characterImageId'),
	};
}

export function getUndoCharacterCropFixValues(
	formData: FormData,
): ZodSafeParseResult<UndoCharacterCropFixValues> {
	return UndoCharacterCropFixValuesSchema.safeParse(decodeUndoCharacterCropFixValues(formData));
}
