import { z } from 'zod';

export const SeasonEnum = z.enum(['spring', 'summer', 'autumn', 'winter']);

export const TimeOfDayEnum = z.enum(['dawn', 'morning', 'noon', 'afternoon', 'dusk', 'night']);

export const ComicStyleEnum = z.enum(['anime', 'classic-marvel', 'franco-belgian']);
export type ComicStyle = z.infer<typeof ComicStyleEnum>;
export const ComicStyleDescriptionSchema = z.object({
	id: ComicStyleEnum,
	linework: z
		.string()
		.describe("e.g. 'bold black ink outlines, variable line weights', 'delicate fine lines'"),
	coloringStyle: z
		.string()
		.describe("e.g. 'flat cel shading with soft gradients', 'ben-day dots halftone process color'"),
	shadingAndLighting: z
		.string()
		.describe("e.g. 'dramatic chiaroscuro high contrast shadows', 'soft muted ambient lighting'"),
	palette: z
		.array(z.string())
		.describe("e.g. ['vibrant primary colors', 'desaturated earth tones', 'monochrome']"),
	masterStylePrompt: z
		.string()
		.describe(
			"A concatenated prompt modifier string for image generation (e.g., '1980s Marvel comic art style, bold ink lineart, halftone dot shading, vintage paper texture')",
		),
});
export type ComicStyleDescription = z.infer<typeof ComicStyleDescriptionSchema>;

export const YearSchema = z.number().int();

export const CropSchema = z.object({
	x: z.number(),
	y: z.number(),
	width: z.number(),
	height: z.number(),
});
export type Crop = z.infer<typeof CropSchema>;

export const CharachterPositionsSchema = z.object({
	id: z.string(),
	head: CropSchema,
	full: CropSchema,
});

export const ImageAssetSchema = z.object({
	src: z.string(),
	width: z.number().int().positive(),
	height: z.number().int().positive(),
});
export type ImageAsset = z.infer<typeof ImageAssetSchema>;

export const PanelImageAssetSchema = ImageAssetSchema.extend({
	characters: z.optional(z.array(CharachterPositionsSchema)),
});
export type PanelImageAsset = z.infer<typeof PanelImageAssetSchema>;

/** The head and full-body crops of one version of a character image. */
export const CharacterImageCropsSchema = z.object({
	head: ImageAssetSchema,
	full: ImageAssetSchema,
});

export const CharacterImageSchema = CharacterImageCropsSchema.extend({
	id: z.uuid(),
	panelId: z.uuid(),
	/** The version before the latest crop fix; one undo step (REQ-219-2). */
	previous: z.optional(CharacterImageCropsSchema),
});
export type CharacterImage = z.infer<typeof CharacterImageSchema>;

/** The two shapes a panel image can be stored in; a comic's image format asks for one or both. */
export const ImageVariantEnum = z.enum(['portrait', 'landscape']);
export type ImageVariant = z.infer<typeof ImageVariantEnum>;

/** A comic's image format (REQ-103-1). A comic without one saved is `both`. */
export const ImageFormatEnum = z.enum(['both', 'portrait', 'landscape']);
export type ImageFormat = z.infer<typeof ImageFormatEnum>;

/**
 * Old data stored the one generated file under both keys. Read it as portrait only,
 * so no migration is needed (REQ-103-2); new images never share a file.
 */
function withoutLegacyLandscapeCopy<
	T extends { portrait?: { src: string }; landscape?: { src: string } },
>(image: T): T {
	if (image.portrait && image.landscape && image.portrait.src === image.landscape.src) {
		return { ...image, landscape: undefined };
	}

	return image;
}

export const ResponsivePanelImageSchema = z
	.object({
		portrait: z.optional(PanelImageAssetSchema),
		landscape: z.optional(PanelImageAssetSchema),
		alt: z.string(),
	})
	.refine((image) => image.portrait !== undefined || image.landscape !== undefined, {
		message: 'A panel image has at least one variant',
	})
	.transform(withoutLegacyLandscapeCopy);
export type ResponsivePanelImage = z.infer<typeof ResponsivePanelImageSchema>;

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
	images: z.array(CharacterImageSchema),
});
export type Character = z.infer<typeof CharacterSchema>;

export const SettingSchema = z.object({
	years: z.array(YearSchema),
	seasons: z.array(SeasonEnum),
	locations: z.array(z.string()),
	timeOfDays: z.array(TimeOfDayEnum),
});

export const DialogueSchema = z.object({
	characterId: z.uuid(),
	text: z.string(),
});

export const PreviousPanelImageSchema = z.object({
	image: ResponsivePanelImageSchema,
	/** Ids of the character crops taken from that image. */
	cropIds: z.array(z.string()),
});

export const PanelSchema = z.object({
	id: z.uuid(),
	editorialTitle: z.string(),
	visualDescription: z.string(),
	captions: z.array(z.string()),
	dialogue: z.array(DialogueSchema),
	year: YearSchema,
	place: z.string(),
	timeOfDay: TimeOfDayEnum,
	season: SeasonEnum,
	style: z.optional(ComicStyleDescriptionSchema),
	image: z.optional(ResponsivePanelImageSchema),
	/** Ids of the character crops taken from `image`, so a restore can drop them. */
	imageCropIds: z.optional(z.array(z.string())),
	/** One step of undo: the image shown before the latest replacement. */
	previousImage: z.optional(PreviousPanelImageSchema),
});
export type Panel = z.infer<typeof PanelSchema>;

export const PanelArraySchema = z.array(PanelSchema);

export const ComicSchema = z.object({
	id: z.uuid(),
	title: z.string(),
	source: z.optional(z.url()),
	story: z.optional(z.string()),
	/** Has the variants the comic's format asks for, like a panel image (REQ-280-1). */
	cover: z.optional(ResponsivePanelImageSchema),
	style: ComicStyleEnum,
	/** Unset for existing and example comics, which mean `both` (REQ-103-1). */
	imageFormat: z.optional(ImageFormatEnum),
	panels: PanelArraySchema,
	setting: z.optional(SettingSchema),
	characters: z.array(CharacterSchema),
});
export type Comic = z.infer<typeof ComicSchema>;

export const ModelSchema = z.string();
export type Model = z.infer<typeof ModelSchema>;

export const TEXT_MODEL_KEY = 'textModel';
export const IMAGE_MODEL_KEY = 'imageModel';
export const ConfigSchema = z.object({
	[TEXT_MODEL_KEY]: ModelSchema,
	[IMAGE_MODEL_KEY]: ModelSchema,
});
