import {
	CreatePanelImageValuesSchema,
	INCLUDE_IMAGE_VALUE_KEY,
	INSTRUCTIONS_VALUE_KEY,
} from '$lib/utils/db/dbTypes';
import { z } from 'zod';

export const CreateImageFormPropsSchema = z.object({
	label: z.string(),
	values: CreatePanelImageValuesSchema.omit({
		[INSTRUCTIONS_VALUE_KEY]: true,
		[INCLUDE_IMAGE_VALUE_KEY]: true,
	}),
	imageName: z.string().optional(),
});

export type CreateImageFormProps = z.infer<typeof CreateImageFormPropsSchema>;
