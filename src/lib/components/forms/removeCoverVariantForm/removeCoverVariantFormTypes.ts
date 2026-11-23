import { RemoveCoverVariantValuesSchema } from '#lib/features/comics/contracts/removeCoverVariant.ts';
import { z } from 'zod';

export const RemoveCoverVariantFormPropsSchema = RemoveCoverVariantValuesSchema.extend({
	label: z.string(),
	onSuccess: z.function({ input: [], output: z.void() }).optional(),
});

export type RemoveCoverVariantFormProps = z.infer<typeof RemoveCoverVariantFormPropsSchema>;
