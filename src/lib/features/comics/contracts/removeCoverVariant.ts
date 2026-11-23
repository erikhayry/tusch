import { readString } from '#lib/forms/form-data.ts';
import { ImageVariantEnum } from '#lib/types/index.ts';
import { z, type ZodSafeParseResult } from 'zod';

/** Client-only: the variant is removed in the browser after the no-op action succeeds. */
export { CLIENT_ACTION_NAME as REMOVE_COVER_VARIANT_ACTION } from '#lib/forms/action-names.ts';

export const RemoveCoverVariantValuesSchema = z.object({
	comicId: z.string().min(1),
	variant: ImageVariantEnum,
});
export type RemoveCoverVariantValues = z.output<typeof RemoveCoverVariantValuesSchema>;

export function decodeRemoveCoverVariantValues(formData: FormData) {
	return {
		comicId: readString(formData, 'comicId'),
		variant: readString(formData, 'variant'),
	};
}

export function getRemoveCoverVariantValues(
	formData: FormData,
): ZodSafeParseResult<RemoveCoverVariantValues> {
	return RemoveCoverVariantValuesSchema.safeParse(decodeRemoveCoverVariantValues(formData));
}
