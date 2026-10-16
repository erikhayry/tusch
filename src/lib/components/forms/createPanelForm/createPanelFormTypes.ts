import { CreatePanelValuesSchema } from '$lib/utils/actions/createPanel';
import { z } from 'zod';

export const CreatePanelFormPropsSchema = z.object({
	label: z.string(),
	values: CreatePanelValuesSchema,
});

export type CreatePanelFormProps = z.infer<typeof CreatePanelFormPropsSchema>;
