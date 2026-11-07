import { CreatePanelValuesSchema } from '$lib/features/panels/contracts/createPanel';
import { z } from 'zod';

export const CreatePanelFormPropsSchema = z.object({
	label: z.string(),
	values: CreatePanelValuesSchema,
});

export type CreatePanelFormProps = z.infer<typeof CreatePanelFormPropsSchema>;
