import { CharacterSchema, ComicSchema, ComicStyleEnum, PanelSchema } from '#lib/types/index.ts';
import { z } from 'zod';

export const PanelPropsSchema = z.object({
	panel: PanelSchema,
	number: z.int(),
	totalNumberOfPanels: z.int(),
	comicId: z.string(),
	style: ComicStyleEnum,
	customStyle: ComicSchema.shape.customStyle,
	characters: z.array(CharacterSchema),
});

export const PanelThumbnailPropsSchema = z.object({
	panel: PanelSchema.pick({
		image: true,
		editorialTitle: true,
	}),
});

export type PanelProps = z.infer<typeof PanelPropsSchema>;

export type PanelThumbnailProps = z.infer<typeof PanelThumbnailPropsSchema>;
