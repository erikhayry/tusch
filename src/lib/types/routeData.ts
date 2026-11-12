import {
	CharacterSchema,
	ComicSchema,
	ComicStyleEnum,
	IMAGE_MODEL_KEY,
	ModelSchema,
	PanelSchema,
	TEXT_MODEL_KEY,
} from '$lib/types';
import { z } from 'zod';

export const ComicsPageDataSchema = z.object({
	comics: z.array(ComicSchema),
});

export const ComicPageDataSchema = z.object({
	comic: ComicSchema,
});

export const PanelPageDataSchema = z.object({
	panel: PanelSchema,
	panels: z.array(PanelSchema),
	totalNumberOfPanels: z.number().int().nonnegative(),
	index: z.number().int().nonnegative(),
	number: z.number().int().positive(),
	comicId: ComicSchema.shape.id,
	style: ComicStyleEnum,
	characters: z.array(CharacterSchema),
});

export const SettingsPageDataSchema = z.object({
	[TEXT_MODEL_KEY]: z.array(ModelSchema),
	[IMAGE_MODEL_KEY]: z.array(ModelSchema),
});

export const AiModelsResponseSchema = z.object({
	data: z.array(z.object({ id: ModelSchema })),
});

export const ComicRouteParamsSchema = z.object({
	id: ComicSchema.shape.id,
});

export const PanelRouteParamsSchema = ComicRouteParamsSchema.extend({
	panel: PanelSchema.shape.id,
});
