import { RemovePanelImageVariantValuesSchema } from '#lib/features/panels/contracts/removePanelImageVariant.ts';
import { z } from 'zod';

export const RemovePanelImageVariantFormPropsSchema = RemovePanelImageVariantValuesSchema.extend({
	label: z.string(),
	onSuccess: z.function({ input: [], output: z.void() }).optional(),
});

export type RemovePanelImageVariantFormProps = z.infer<
	typeof RemovePanelImageVariantFormPropsSchema
>;
