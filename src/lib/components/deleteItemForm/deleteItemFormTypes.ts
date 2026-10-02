import { DeleteValuesSchema } from '$lib/utils/db/dbTypes';
import { z } from 'zod';

export const DeleteItemFormPropsSchema = z.object({
	label: z.string(),
	values: DeleteValuesSchema,
});

export type DeleteItemFormProps = z.infer<typeof DeleteItemFormPropsSchema>;
