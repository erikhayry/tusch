import { CreateImageSchema } from '$lib/utils/ai/aiTypes';
import { z } from 'zod';

export const CreateImageResponseSchema = CreateImageSchema.merge(z.object({ src: z.string() }));
export type CreateImageResponse = z.infer<typeof CreateImageResponseSchema>;
