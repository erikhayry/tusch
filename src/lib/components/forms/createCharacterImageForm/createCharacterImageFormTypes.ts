import { CreateCharacterImageValueSchema } from '$lib/utils/db/dbTypes';
import { z } from 'zod';

export const CreateCharacterImageFormPropsSchema = z.object({
	label: z.string(),
	values: CreateCharacterImageValueSchema,
});

export type CreateCharacterImageFormProps = z.infer<typeof CreateCharacterImageFormPropsSchema>;
