import { EditValuesSchema } from '$lib/utils/db/dbTypes';
import { z } from 'zod';

export const EditTextFieldFormPropsSchema = z.object({
	values: EditValuesSchema,
	label: z.string(),
	saveActionLabel: z.string(),
	editActionLabel: z.string(),
	visibleText: z.string(),
});

export type EditTextFieldFormProps = z.infer<typeof EditTextFieldFormPropsSchema>;
