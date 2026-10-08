import { ComicSchema, PanelSchema } from '$lib/types';
import z from 'zod';

const INITAL_PANEL_SCHEMA = PanelSchema.pick({
	captions: true,
	dialogue: true,
	visualDescription: true,
	place: true,
	season: true,
	timeOfDay: true,
	year: true,
	id: true,
});

export const InitialComicSchema = z.object({
	title: ComicSchema.shape.title,
	characters: ComicSchema.shape.characters,
	panels: z.array(INITAL_PANEL_SCHEMA),
});
export type InitialComic = z.infer<typeof InitialComicSchema>;

export const CreateImageSchema = z.object({
	alt: z.string(),
	width: z.number(),
	height: z.number(),
});
export type CreateImage = z.infer<typeof CreateImageSchema>;

export const CreatedImageSchema = CreateImageSchema.merge(z.object({ src: z.string() }));
export type CreatedImage = z.infer<typeof CreatedImageSchema>;

export const CreatePanelSchema = INITAL_PANEL_SCHEMA;
export type CreatePanel = z.infer<typeof CreatePanelSchema>;

export const SchemaName = z.enum(['initComic', 'createImage', 'createPanel']);
export type SchemaName = z.infer<typeof SchemaName>;

export const SCHEMA: Record<SchemaName, z.ZodType> = {
	initComic: InitialComicSchema,
	createImage: CreateImageSchema,
	createPanel: CreatePanelSchema,
} as const;

export const OpenAiImageOutputSchema = z.object({
	output: z.array(
		z.object({
			type: z.string(),
			result: z.optional(z.string()),
			content: z
				.array(
					z.object({
						type: z.string(),
						text: z.string(),
					}),
				)
				.optional(),
		}),
	),
});

export type OpenAiImageOutput = z.infer<typeof OpenAiImageOutputSchema>;
