import { CLIENT_ACTION_NAME } from '$lib/forms/action-names';
import { readString } from '$lib/forms/form-data';
import { z, type ZodSafeParseResult } from 'zod';

/** Client-only: the image is restored in the browser after the no-op action succeeds. */
export const RESTORE_PANEL_IMAGE_ACTION = CLIENT_ACTION_NAME;

export const RestorePanelImageValuesSchema = z.object({
	comicId: z.string().min(1),
	panelId: z.string().min(1),
});
export type RestorePanelImageValues = z.output<typeof RestorePanelImageValuesSchema>;

export function decodeRestorePanelImageValues(formData: FormData) {
	return {
		comicId: readString(formData, 'comicId'),
		panelId: readString(formData, 'panelId'),
	};
}

export function getRestorePanelImageValues(
	formData: FormData,
): ZodSafeParseResult<RestorePanelImageValues> {
	return RestorePanelImageValuesSchema.safeParse(decodeRestorePanelImageValues(formData));
}
