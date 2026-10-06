import { ComicSchema, PanelSchema } from '$lib/types';
import z from 'zod';

export const InitialComicSchema = z.object({
	title: ComicSchema.shape.title,
	panels: z.array(
		PanelSchema.pick({
			captions: true,
			dialogue: true,
			visualDescription: true,
			place: true,
			season: true,
			timeOfDay: true,
			year: true,
		}),
	),
});
export type InitialComic = z.infer<typeof InitialComicSchema>;

export const CreateImageSchema = z.object({
	alt: z.string(),
	width: z.number(),
	height: z.number(),
});
export type CreateImage = z.infer<typeof CreateImageSchema>;

export const SchemaName = z.enum(['initComic', 'createImage']);
export type SchemaName = z.infer<typeof SchemaName>;

export const SCHEMA: Record<SchemaName, z.ZodType> = {
	initComic: InitialComicSchema,
	createImage: CreateImageSchema,
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
