import { z } from 'zod';

export const TextFieldFormPropsSchema = z.object({
	action: z.string(),
	values: z.array(
		z.object({
			name: z.string(),
			value: z.string().or(z.number()),
		}),
	),
	field: z.object({
		name: z.string(),
		value: z.string(),
	}),
	label: z.string(),
	saveActionLabel: z.string(),
	editActionLabel: z.string(),
});

export type TextFieldFormProps = z.infer<typeof TextFieldFormPropsSchema>;
