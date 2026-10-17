import { CharachterPositionsSchema, ComicSchema, PanelSchema } from '$lib/types';
import z from 'zod';

const INITAL_PANEL_SCHEMA = PanelSchema.pick({
	editorialTitle: true,
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
	style: ComicSchema.shape.style,
	title: ComicSchema.shape.title,
	characters: ComicSchema.shape.characters,
	panels: z.array(INITAL_PANEL_SCHEMA),
});
export type InitialComic = z.infer<typeof InitialComicSchema>;

export const CreateImageSchema = z.object({
	alt: z.string(),
	width: z.number(),
	height: z.number(),
	characters: z.array(CharachterPositionsSchema),
});
export type CreateImage = z.infer<typeof CreateImageSchema>;

export const CreatedImageSchema = CreateImageSchema.merge(z.object({ src: z.string() }));
export type CreatedImage = z.infer<typeof CreatedImageSchema>;

export const CreatePanelSchema = INITAL_PANEL_SCHEMA;
export type CreatePanel = z.infer<typeof CreatePanelSchema>;

export const PingSchema = z.object({
	success: z.boolean(),
	message: z.string(),
});
export type Ping = z.infer<typeof PingSchema>;

export const SchemaName = z.enum(['initComic', 'createImage', 'createPanel']);
export type SchemaName = z.infer<typeof SchemaName>;

export const SCHEMA: Record<SchemaName, z.ZodType> = {
	initComic: InitialComicSchema,
	createImage: CreateImageSchema,
	createPanel: CreatePanelSchema,
} as const;

export const OpenAiOutputSchema = z.object({
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

export type OpenAiOutput = z.infer<typeof OpenAiOutputSchema>;

export const OpenAiPingSchema = z.object({
	status: z.boolean(),
	message: z.string(),
});
export type OpenAiPingOutput = z.infer<typeof OpenAiPingSchema>;
