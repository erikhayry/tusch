import { ComicStyleEnum } from '$lib/types';
import z from 'zod';

export const DB_ITEM_TYPE = z.enum([
	'dialogue',
	'captions',
	'panels',
	'comics',
	'panelImage',
	'coverImage',
]);
export type DbItemType = z.infer<typeof DB_ITEM_TYPE>;

export const DeleteValuesSchema = z
	.object({
		comicId: z.string(),
		panelId: z.string(),
		index: z.number(),
		type: z.enum([DB_ITEM_TYPE.enum.captions, DB_ITEM_TYPE.enum.dialogue]),
	})
	.or(
		z.object({
			comicId: z.string(),
			panelId: z.string(),
			type: z.enum([DB_ITEM_TYPE.enum.panels]),
		}),
	)
	.or(
		z.object({
			comicId: z.string(),
			type: z.enum([DB_ITEM_TYPE.enum.comics]),
		}),
	)
	.or(
		z.object({
			comicId: z.string(),
			panelId: z.string(),
			type: z.enum([DB_ITEM_TYPE.enum.panelImage]),
		}),
	)
	.or(
		z.object({
			comicId: z.string(),
			type: z.enum([DB_ITEM_TYPE.enum.coverImage]),
		}),
	);
export type DeleteValues = z.infer<typeof DeleteValuesSchema>;

export const EditValuesSchema = z.object({
	comicId: z.string(),
	panelId: z.string(),
	index: z.number(),
	value: z.string(),
	type: z.enum([DB_ITEM_TYPE.enum.captions, DB_ITEM_TYPE.enum.dialogue]),
});
export type EditValues = z.infer<typeof EditValuesSchema>;

export const INSTRUCTIONS_VALUE_KEY = 'instructions';
export const INCLUDE_IMAGE_VALUE_KEY = 'includeImage';
export const IMAGE_VALUE_KEY = 'imageUrl';

export const CreatePanelImageValuesSchema = z.object({
	panelJsonString: z.string(),
	comicId: z.string(),
	style: ComicStyleEnum,
	charactersJsonString: z.string(),
	[INSTRUCTIONS_VALUE_KEY]: z.string(),
	imageUrl: z.string().optional(),
	[INCLUDE_IMAGE_VALUE_KEY]: z.boolean(),
});
export type CreatePanelImageValues = z.infer<typeof CreatePanelImageValuesSchema>;

export const CreateCoverImageValuesSchema = z.object({
	comicJsonString: z.string(),
	[INSTRUCTIONS_VALUE_KEY]: z.string(),
	imageUrl: z.string().optional(),
	[INCLUDE_IMAGE_VALUE_KEY]: z.boolean(),
});
export type CreateCoverImageValues = z.infer<typeof CreateCoverImageValuesSchema>;

export const CreatePanelValuesSchema = z.object({
	comicId: z.string(),
	panelsJsonString: z.string(),
	index: z.number().int(),
});
export type CreatePanelValues = z.infer<typeof CreatePanelValuesSchema>;

export const CreateComicValuesSchema = z.object({
	url: z.url(),
	style: ComicStyleEnum,
});
export type CreateComicValues = z.infer<typeof CreateComicValuesSchema>;

export const ByokValuesSchema = z.object({
	key: z.string(),
});
export type ByokValues = z.infer<typeof ByokValuesSchema>;
