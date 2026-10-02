import { EditValuesSchema } from '$lib/utils/db/dbTypes';
import { z } from 'zod';

const LabelSchema = z.function({
	input: [
		z.object({
			number: z.number(),
		}),
	],
	output: z.string(),
});

export const FieldActionsPropsSchema = z.object({
	values: EditValuesSchema,
	editActionLabel: LabelSchema,
	saveActionLabel: LabelSchema,
	removeActionLabel: LabelSchema,
});

export type FieldActionsProps = z.infer<typeof FieldActionsPropsSchema>;
