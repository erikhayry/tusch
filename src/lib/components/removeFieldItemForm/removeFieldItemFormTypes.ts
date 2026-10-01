import { z } from 'zod';

export const RemoveFieldItemFormPropsSchema = z.object({
	label: z.string(),
	action: z.string(),
	values: z.array(
		z.object({
			name: z.string(),
			value: z.string().or(z.number()),
		}),
	),
});

export type RemoveFieldItemFormProps = z.infer<typeof RemoveFieldItemFormPropsSchema>;
