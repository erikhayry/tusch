import { CreatePanelImageValuesSchema } from '$lib/features/panels/contracts/createPanelImage';
import { GLOBAL_INSTRUCTIONS_VALUE_KEY } from '$lib/features/settings/contracts/globalInstructions';
import { INCLUDE_IMAGE_VALUE_KEY, INSTRUCTIONS_VALUE_KEY } from '$lib/utils/db/dbTypes';
import { z } from 'zod';

export const CreatePanelImageFormPropsSchema = z.object({
	label: z.string(),
	values: CreatePanelImageValuesSchema.omit({
		[INSTRUCTIONS_VALUE_KEY]: true,
		[GLOBAL_INSTRUCTIONS_VALUE_KEY]: true,
		[INCLUDE_IMAGE_VALUE_KEY]: true,
	}),
	imageName: z.string().optional(),
});

export type CreatePanelImageFormProps = z.infer<typeof CreatePanelImageFormPropsSchema>;
