import { ComicStyleEnum, PanelSchema } from '$lib/types';
import { z } from 'zod';

export const PanelPropsSchema = z.object({
	panel: PanelSchema,
	number: z.int(),
	totalNumberOfPanels: z.int(),
	comicId: z.string(),
	style: ComicStyleEnum,
});

export const PanelThumbnailPropsSchema = z.object({
	panel: PanelSchema.pick({
		id: true,
		image: true,
	}),
	alt: z.string(),
});

export type PanelProps = z.infer<typeof PanelPropsSchema>;

export type PanelThumbnailProps = z.infer<typeof PanelThumbnailPropsSchema>;
