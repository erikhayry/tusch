import { z } from 'zod';

export const SeasonEnum = z.enum(['spring', 'summer', 'autumn', 'winter']);
export type Season = z.infer<typeof SeasonEnum>;

export const TimeOfDayEnum = z.enum(['dawn', 'morning', 'noon', 'afternoon', 'dusk', 'night']);
export type TimeOfDay = z.infer<typeof TimeOfDayEnum>;

export const YearSchema = z.number().int();

export const ImageAssetSchema = z.object({
	src: z.url(),
	width: z.number().int().positive(),
	height: z.number().int().positive()
});
export type ImageAsset = z.infer<typeof ImageAssetSchema>;

export const ResponsiveImageSchema = z.object({
	wide: ImageAssetSchema,
	narrow: ImageAssetSchema,
	alt: z.string().min(1)
});
export type ResponsiveImage = z.infer<typeof ResponsiveImageSchema>;

export const CharacterSchema = z.object({
	id: z.uuid(),
	name: z.string().min(1),
	description: z.string(),
	images: z.array(z.url())
});
export type Character = z.infer<typeof CharacterSchema>;

export const ComicSettingSchema = z.object({
	years: z.array(YearSchema),
	seasons: z.array(SeasonEnum),
	places: z.array(z.string().min(1)),
	timeOfDays: z.array(TimeOfDayEnum)
});
export type ComicSetting = z.infer<typeof ComicSettingSchema>;

export const DialogueSchema = z.object({
	characterId: z.uuid(),
	text: z.string().min(1)
});
export type Dialogue = z.infer<typeof DialogueSchema>;

export const ScriptPanelSchema = z.object({
	captions: z.array(z.string()),
	dialogue: z.array(DialogueSchema),
	year: YearSchema,
	season: SeasonEnum,
	place: z.string().min(1),
	timeOfDay: TimeOfDayEnum
});
export type ScriptPanel = z.infer<typeof ScriptPanelSchema>;

export const ComicScriptSchema = z.object({
	source: z.url(),
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
	title: z.string().min(1),
	script: ComicScriptSchema,
	panels: z.array(ComicPanelSchema)
});
export type Comic = z.infer<typeof ComicSchema>;
