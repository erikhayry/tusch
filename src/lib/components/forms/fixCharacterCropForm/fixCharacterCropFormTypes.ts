import { FixCharacterCropValuesSchema } from '#lib/features/panels/contracts/fixCharacterCrop.ts';
import { z } from 'zod';

export const FixCharacterCropFormPropsSchema = z.object({
	label: z.string(),
	/** Everything but the image, which the form reads from OPFS on submit. */
	values: FixCharacterCropValuesSchema.omit({ image: true }),
	/** Asset id of the panel's current landscape image. */
	imageAssetId: z.string(),
});

export type FixCharacterCropFormProps = z.infer<typeof FixCharacterCropFormPropsSchema>;
