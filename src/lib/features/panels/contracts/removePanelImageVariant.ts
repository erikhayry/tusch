import { readString } from '#lib/forms/form-data.ts';
import { ImageVariantEnum } from '#lib/types/index.ts';
import { z, type ZodSafeParseResult } from 'zod';

/** Client-only: the variant is removed in the browser after the no-op action succeeds. */
export { CLIENT_ACTION_NAME as REMOVE_PANEL_IMAGE_VARIANT_ACTION } from '#lib/forms/action-names.ts';

export const RemovePanelImageVariantValuesSchema = z.object({
	comicId: z.string().min(1),
	panelId: z.string().min(1),
	variant: ImageVariantEnum,
});
export type RemovePanelImageVariantValues = z.output<typeof RemovePanelImageVariantValuesSchema>;

export function decodeRemovePanelImageVariantValues(formData: FormData) {
	return {
		comicId: readString(formData, 'comicId'),
		panelId: readString(formData, 'panelId'),
		variant: readString(formData, 'variant'),
	};
}

export function getRemovePanelImageVariantValues(
	formData: FormData,
): ZodSafeParseResult<RemovePanelImageVariantValues> {
	return RemovePanelImageVariantValuesSchema.safeParse(
		decodeRemovePanelImageVariantValues(formData),
	);
}
