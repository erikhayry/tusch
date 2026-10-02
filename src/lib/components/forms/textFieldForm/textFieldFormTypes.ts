import { EditValuesSchema } from '$lib/utils/db/dbTypes';
import { z } from 'zod';

export const TextFieldFormPropsSchema = z.object({
	action: z.string(),
	values: EditValuesSchema,
	label: z.string(),
	saveActionLabel: z.string(),
	editActionLabel: z.string(),
});

export type TextFieldFormProps = z.infer<typeof TextFieldFormPropsSchema>;
