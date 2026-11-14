import { CreatePanelValuesSchema } from '$lib/features/panels/contracts/createPanel';
import { GLOBAL_INSTRUCTIONS_VALUE_KEY } from '$lib/features/settings/contracts/globalInstructions';
import { z } from 'zod';

export const CreatePanelFormPropsSchema = z.object({
	label: z.string(),
	values: CreatePanelValuesSchema.omit({ [GLOBAL_INSTRUCTIONS_VALUE_KEY]: true }),
});

export type CreatePanelFormProps = z.infer<typeof CreatePanelFormPropsSchema>;
