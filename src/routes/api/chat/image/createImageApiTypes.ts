import { CreatedImageSchema } from '$lib/utils/ai/aiTypes';
import { z } from 'zod';

export const CreateImageResponseSchema = z.object({
	panelId: z.string(),
	image: CreatedImageSchema,
});
export type CreateImageResponse = z.infer<typeof CreateImageResponseSchema>;
