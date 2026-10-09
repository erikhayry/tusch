import { CreateImageValuesSchema, INSTRUCTIONS_VALUE_KEY } from '$lib/utils/db/dbTypes';
import { z } from 'zod';

export const CreateImageFormPropsSchema = z.object({
	label: z.string(),
	values: CreateImageValuesSchema.omit({ [INSTRUCTIONS_VALUE_KEY]: true }),
});

export type CreateImageFormProps = z.infer<typeof CreateImageFormPropsSchema>;
