import { CreatePanelSchema } from '$lib/utils/ai/aiTypes';
import { z } from 'zod';

export const CreatePanelResponseSchema = z.object({
	panel: CreatePanelSchema,
	output: z.unknown(),
});
export type CreatePanelResponse = z.infer<typeof CreatePanelResponseSchema>;
