import z from 'zod';

export const DB_ITEM_TYPE = z.enum(['dialogue', 'captions', 'panels', 'comics', 'image']);
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
			type: z.enum([DB_ITEM_TYPE.enum.image]),
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

export const CreateImageValuesSchema = z.object({
	panelJsonString: z.string(),
	comicId: z.string(),
});
export type CreateImageValues = z.infer<typeof CreateImageValuesSchema>;

export const CreatePanelValuesSchema = z.object({
	comicId: z.string(),
	index: z.number(),
});
export type CreatePanelValues = z.infer<typeof CreatePanelValuesSchema>;

export const CreateComicValuesSchema = z.object({
	url: z.string(),
});
export type CreateComicValues = z.infer<typeof CreateComicValuesSchema>;
