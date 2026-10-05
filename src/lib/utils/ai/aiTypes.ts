import { PanelSchema } from '$lib/types';
import z from 'zod';

export const InitialPanelsSchema = z.array(PanelSchema.pick({ captions: true, dialogue: true }));
export type InitialPanels = z.infer<typeof InitialPanelsSchema>;

export const CreateImageSchema = z.object({
	alt: z.string(),
	widht: z.number(),
	height: z.number(),
});
export type CreateImage = z.infer<typeof CreateImageSchema>;
