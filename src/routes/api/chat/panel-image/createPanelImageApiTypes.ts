import { CreatedImageSchema } from '$lib/utils/ai/aiTypes';
import { z } from 'zod';

export const CreatePanelImageResponseSchema = z.object({
	panelId: z.string(),
	image: z.object({
		landscape: CreatedImageSchema,
		portrait: CreatedImageSchema,
	}),
	output: z.unknown(),
});
export type CreatePanelImageResponse = z.infer<typeof CreatePanelImageResponseSchema>;
