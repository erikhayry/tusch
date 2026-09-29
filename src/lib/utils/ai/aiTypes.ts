import { PanelSchema } from '$lib/types';
import z from 'zod';

export const InitialPanelsSchema = z.array(PanelSchema.pick({ captions: true, dialogue: true }));
export type InitialPanels = z.infer<typeof InitialPanelsSchema>;
