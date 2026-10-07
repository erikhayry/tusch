import { z } from 'zod';

export const CreateComicFormPropsSchema = z.object({
	createComicForm: z.object({
		name: z.string(),
	}),
});

export type CreateComicFormProps = z.infer<typeof CreateComicFormPropsSchema>;
