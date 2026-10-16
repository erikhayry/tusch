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
