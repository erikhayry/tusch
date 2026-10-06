import { CreatePanelSchema } from '$lib/utils/ai/aiTypes';
import { z } from 'zod';

export const CreatePanelResponseSchema = CreatePanelSchema;
export type CreatePanelResponse = z.infer<typeof CreatePanelResponseSchema>;
