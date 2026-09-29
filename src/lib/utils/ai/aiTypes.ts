import { PanelSchema } from '$lib/types';
import type z from 'zod';

export const InitialPanelSchema = PanelSchema.pick({ captions: true, dialogue: true });
export type InitialPanel = z.infer<typeof InitialPanelSchema>;
