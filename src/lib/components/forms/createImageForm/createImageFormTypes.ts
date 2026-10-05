import { CreateImageValuesSchema } from '$lib/utils/db/dbTypes';
import { z } from 'zod';

export const CreateImageFormPropsSchema = z.object({
	label: z.string(),
	values: CreateImageValuesSchema,
});

export type CreateImageFormProps = z.infer<typeof CreateImageFormPropsSchema>;
