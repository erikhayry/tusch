import {
	CreateCoverImageValuesSchema,
	INCLUDE_IMAGE_VALUE_KEY,
	INSTRUCTIONS_VALUE_KEY,
} from '$lib/utils/db/dbTypes';
import { z } from 'zod';

export const CreateCoverImageFormPropsSchema = z.object({
	label: z.string(),
	values: CreateCoverImageValuesSchema.omit({
		[INSTRUCTIONS_VALUE_KEY]: true,
		[INCLUDE_IMAGE_VALUE_KEY]: true,
	}),
	imageName: z.string().optional(),
});

export type CreateCoverImageFormProps = z.infer<typeof CreateCoverImageFormPropsSchema>;
