import { z } from 'zod';

export const SeasonEnum = z.enum(['spring', 'summer', 'autumn', 'winter']);
export type Season = z.infer<typeof SeasonEnum>;

export const TimeOfDayEnum = z.enum(['dawn', 'morning', 'noon', 'afternoon', 'dusk', 'night']);
export type TimeOfDay = z.infer<typeof TimeOfDayEnum>;

export const UrlValue = z.url();
export type Url = z.infer<typeof UrlValue>;

export const YearSchema = z.number().int();

export const ImageAssetSchema = z.object({
	src: z.string(),
	width: z.number().int().positive(),
	height: z.number().int().positive(),
});
export type ImageAsset = z.infer<typeof ImageAssetSchema>;

export const ResponsiveImageSchema = z.object({
	wide: ImageAssetSchema,
	narrow: ImageAssetSchema,
	alt: z.string(),
});
export type ResponsiveImage = z.infer<typeof ResponsiveImageSchema>;

export const CharacterDescriptionSchema = z.object({
	// Core demographics & face
	apparentAge: z.string().describe("e.g. 'late 20s', 'elderly', 'child'"),
	gender: z.string().describe("e.g. 'female', 'male', 'non-binary'"),
	ethnicityOrSpecies: z.string().describe("e.g. 'East Asian', 'Elf', 'Caucasian'"),

	// Facial details (critical for image model consistency)
	facialFeatures: z.object({
		faceShape: z.string().describe("e.g. 'square jaw', 'round', 'oval'"),
		eyeColorAndShape: z.string().describe("e.g. 'almond-shaped dark brown eyes'"),
		hairStyleAndColor: z.string().describe("e.g. 'short wavy black hair with side part'"),
		facialHair: z.string().nullable().describe("e.g. 'neatly trimmed full beard' or null"),
		distinguishingMarks: z
			.string()
			.nullable()
			.describe("e.g. 'scar over right eye', 'freckles', 'mole on left cheek' or null"),
	}),

	// Physical build
	bodyType: z.string().describe("e.g. 'tall and athletic', 'short and stocky', 'slender'"),
	height: z.string().describe("e.g. 'around 180cm', 'petite'"),

	// Signature attire & accessories
	defaultOutfit: z.object({
		top: z.string().describe("e.g. 'faded denim jacket over a white t-shirt'"),
		bottom: z.string().describe("e.g. 'dark blue slim-fit jeans'"),
		footwear: z.string().describe("e.g. 'scuffed brown leather boots'"),
		accessories: z.array(z.string()).describe("e.g. ['round silver wire glasses', 'red scarf']"),
	}),

	// Condensed master prompt string generated for image generators
	masterVisualPrompt: z
		.string()
		.describe(
			"A single concatenated prompt string highlighting key features (e.g., '28yo Asian male, short wavy black hair, wearing round silver wire glasses, faded denim jacket, scuffed brown boots')",
		),
});

export const CharacterSchema = z.object({
	id: z.uuid(),
	name: z.string(),
	description: CharacterDescriptionSchema,
});
export type Character = z.infer<typeof CharacterSchema>;

export const SettingSchema = z.object({
	years: z.array(YearSchema),
	seasons: z.array(SeasonEnum),
	locations: z.array(z.string()),
	timeOfDays: z.array(TimeOfDayEnum),
});
export type Setting = z.infer<typeof SettingSchema>;

export const DialogueSchema = z.object({
	characterId: z.uuid(),
	text: z.string(),
});
export type Dialogue = z.infer<typeof DialogueSchema>;

export const PanelSchema = z.object({
	id: z.uuid(),
	visualDescription: z.string(),
	captions: z.array(z.string()),
	dialogue: z.array(DialogueSchema),
	year: YearSchema,
	place: z.string(),
	timeOfDay: TimeOfDayEnum,
	season: SeasonEnum,
	image: z.optional(ResponsiveImageSchema),
});
export type Panel = z.infer<typeof PanelSchema>;

export const PanelArraySchema = z.array(PanelSchema);
export type PanelArray = z.infer<typeof PanelArraySchema>;

export const ComicSchema = z.object({
	id: z.uuid(),
	title: z.string(),
	source: z.url(),
	panels: PanelArraySchema,
	setting: z.optional(SettingSchema),
	characters: z.array(CharacterSchema),
});
export type Comic = z.infer<typeof ComicSchema>;
