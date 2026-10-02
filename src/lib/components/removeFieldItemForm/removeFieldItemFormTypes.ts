import { DeleteValuesSchema } from '$lib/utils/db/dbTypes';
import { z } from 'zod';

export const RemoveFieldItemFormPropsSchema = z.object({
	label: z.string(),
	values: DeleteValuesSchema,
});

export type RemoveFieldItemFormProps = z.infer<typeof RemoveFieldItemFormPropsSchema>;
