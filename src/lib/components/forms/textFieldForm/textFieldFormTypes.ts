import { EditValuesSchema } from '$lib/utils/db/dbTypes';
import { z } from 'zod';

export const TextFieldFormPropsSchema = z.object({
	values: EditValuesSchema,
	label: z.string(),
	saveActionLabel: z.string(),
	editActionLabel: z.string(),
	visibleText: z.string(),
});

export type TextFieldFormProps = z.infer<typeof TextFieldFormPropsSchema>;
