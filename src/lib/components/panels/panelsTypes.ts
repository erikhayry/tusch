import { PanelSchema } from '$lib/types';
import { z } from 'zod';
import { PanelPropsSchema } from '../panel/panelTypes';

export const PanelsPropsSchema = z.object({
	panels: z.array(PanelSchema),
	comicId: z.string(),
	current: PanelPropsSchema.pick({ panel: true }).merge(
		z.object({
			index: z.number(),
		}),
	),
});

export type PanelsProps = z.infer<typeof PanelsPropsSchema>;
