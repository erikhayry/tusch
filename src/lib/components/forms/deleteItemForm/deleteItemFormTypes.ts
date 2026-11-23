import { DeleteValuesSchema } from '#lib/utils/db/dbTypes.ts';
import { z } from 'zod';

export const DeleteItemFormPropsSchema = z.object({
	label: z.string(),
	/** Icon only: `label` becomes the accessible name (aria-label), no text is shown. */
	iconOnly: z.boolean().optional(),
	values: DeleteValuesSchema,
	onSuccess: z.function({ input: [], output: z.void() }).optional(),
});

export type DeleteItemFormProps = z.infer<typeof DeleteItemFormPropsSchema>;
