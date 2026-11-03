import { ComicSchema, ConfigSchema, CropSchema } from '$lib/types';
import z from 'zod';

export const STORAGE = {
	COMICS: 'comics_db',
	CONFIG: 'config_db',
} as const;

export const ComicEntriesSchema = z.array(z.tuple([z.string(), ComicSchema]));
export type ComicEntries = z.infer<typeof ComicEntriesSchema>;

export const DB_ITEM_TYPE = z.enum([
	'dialogue',
	'captions',
	'panels',
	'comics',
	'panelImage',
	'coverImage',
]);
export type DbItemType = z.infer<typeof DB_ITEM_TYPE>;

export const CreateCharacterImageValueSchema = z.object({
	comicId: z.string(),
	characterId: z.string(),
	image: z.string(),
	crop: CropSchema,
});
export type CreateCharacterImageValue = z.infer<typeof CreateCharacterImageValueSchema>;

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

export const ConfigValuesSchema = ConfigSchema;
export type ConfigValues = z.infer<typeof ConfigValuesSchema>;

export const ConfigStateSchema = ConfigSchema.partial();
export type ConfigState = z.infer<typeof ConfigStateSchema>;
