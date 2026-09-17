import { z } from 'zod';

export const ImageAssetSchema = z.object({
	src: z.string(),
	width: z.number(),
	height: z.number()
});
export type ImageAsset = z.infer<typeof ImageAssetSchema>;

export const ResponsiveImageSchema = z.object({
	wide: ImageAssetSchema,
	narrow: ImageAssetSchema,
	alt: z.string()
});
export type ResponsiveImage = z.infer<typeof ResponsiveImageSchema>;

export const CharacterSchema = z.object({
	id: z.uuid(),
	name: z.string(),
	description: z.string(),
	images: z.array(z.string())
});
export type Character = z.infer<typeof CharacterSchema>;

export const ComicSettingSchema = z.object({
	years: z.array(z.number()),
	seasons: z.array(z.string()),
	places: z.array(z.string()),
	timeOfDays: z.array(z.string())
});
export type ComicSetting = z.infer<typeof ComicSettingSchema>;

export const DialogueSchema = z.object({
	characterId: z.uuid(),
	text: z.string()
});
export type Dialogue = z.infer<typeof DialogueSchema>;

export const ScriptPanelSchema = z.object({
	captions: z.array(z.string()),
	dialogue: z.array(DialogueSchema),
	year: z.number(),
	season: z.string(),
	place: z.string(),
	timeOfDay: z.string()
});
export type ScriptPanel = z.infer<typeof ScriptPanelSchema>;

export const ComicScriptSchema = z.object({
	source: z.string(),
	setting: ComicSettingSchema,
	characters: z.array(CharacterSchema),
	panels: z.array(ScriptPanelSchema)
});
export type ComicScript = z.infer<typeof ComicScriptSchema>;

export const ComicPanelSchema = z.object({
	image: ResponsiveImageSchema,
	captions: z.array(z.string()),
	dialogue: z.array(DialogueSchema)
});
export type ComicPanel = z.infer<typeof ComicPanelSchema>;

export const ComicSchema = z.object({
	id: z.uuid(),
	title: z.string(),
	script: ComicScriptSchema,
	panels: z.array(ComicPanelSchema)
});
export type Comic = z.infer<typeof ComicSchema>;
