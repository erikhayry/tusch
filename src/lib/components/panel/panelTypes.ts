import { PanelSchema } from '$lib/types';
import { z } from 'zod';

export const PanelPropsSchema = z.object({
	panel: PanelSchema.pick({
		id: true,
		image: true
	})
});

export type PanelProps = z.infer<typeof PanelPropsSchema>;

export type PanelThumbnailProps = z.infer<typeof PanelPropsSchema>;
