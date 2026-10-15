import { CreatedImageSchema } from '$lib/utils/ai/aiTypes';
import { z } from 'zod';

export const CreateCoverImageResponseSchema = z.object({
	comicId: z.string(),
	image: z.object({
		landscape: CreatedImageSchema,
		portrait: CreatedImageSchema,
	}),
	output: z.unknown(),
});
export type CreateCoverImageResponse = z.infer<typeof CreateCoverImageResponseSchema>;
