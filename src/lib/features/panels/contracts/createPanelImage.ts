import { readCheckbox, readJsonField, readString, readStringList } from '#lib/forms/form-data.ts';
import {
	GLOBAL_INSTRUCTIONS_VALUE_KEY,
	GlobalInstructionsSchema,
	decodeGlobalInstructions,
} from '#lib/features/settings/contracts/globalInstructions.ts';
import type { Character } from '#lib/types/index.ts';
import {
	ComicStyleEnum,
	PanelSchema,
	ResponsivePanelImageSchema,
	type ImageFormat,
	type Panel,
} from '#lib/types/index.ts';
import { OpenAiOutputSchema } from '#lib/utils/ai/aiTypes.ts';
import {
	IMAGE_FORMAT_VALUE_KEY,
	IMAGE_VALUE_KEY,
	INCLUDE_IMAGE_VALUE_KEY,
	INSTRUCTIONS_VALUE_KEY,
} from '#lib/utils/db/dbTypes.ts';
import { ImageFormatEnum, ImageVariantEnum } from '#lib/types/index.ts';
import z from 'zod';
import { CharacterPromptSchema, toCharacterPrompt } from '../../comics/contracts/prompts';

export const CREATE_PANEL_IMAGE_ACTION = 'create-panel-image' as const;

export const PanelImagePromptSchema = PanelSchema.pick({
	id: true,
	visualDescription: true,
	captions: true,
	dialogue: true,
	place: true,
	year: true,
	season: true,
	timeOfDay: true,
});
export type PanelImagePrompt = z.infer<typeof PanelImagePromptSchema>;

export function toPanelImagePrompt(panel: Panel): PanelImagePrompt {
	const { id, visualDescription, captions, dialogue, place, year, season, timeOfDay } = panel;
	return { id, visualDescription, captions, dialogue, place, year, season, timeOfDay };
}

/** Field holding one data URL per chosen character reference (its full-body crop). */
export const REFERENCE_IMAGES_KEY = 'referenceImages' as const;

/** One per character; bounds the request body, which Vercel caps at about 4.5 MB. */
const MAX_REFERENCE_IMAGES = 10;

export const CreatePanelImageValuesSchema = z.object({
	panel: PanelImagePromptSchema,
	comicId: z.string(),
	style: ComicStyleEnum,
	characters: z.array(CharacterPromptSchema),
	[INSTRUCTIONS_VALUE_KEY]: z.string(),
	[GLOBAL_INSTRUCTIONS_VALUE_KEY]: GlobalInstructionsSchema,
	[IMAGE_VALUE_KEY]: z.string().optional(),
	[INCLUDE_IMAGE_VALUE_KEY]: z.boolean().optional(),
	[REFERENCE_IMAGES_KEY]: z.array(z.string().startsWith('data:image/')).max(MAX_REFERENCE_IMAGES),
	/** Optional for API callers, which get both variants as before (REQ-103-2). */
	[IMAGE_FORMAT_VALUE_KEY]: ImageFormatEnum.optional(),
});
export type CreatePanelImageValues = z.output<typeof CreatePanelImageValuesSchema>;

export function toCreatePanelImageValues(
	comicId: string,
	panel: Panel,
	characters: Character[],
	style: CreatePanelImageValues['style'],
	imageFormat: ImageFormat = ImageFormatEnum.enum.both,
): Pick<CreatePanelImageValues, 'comicId' | 'panel' | 'characters' | 'style' | 'imageFormat'> {
	return {
		comicId,
		panel: toPanelImagePrompt(panel),
		characters: characters.map(toCharacterPrompt),
		style,
		[IMAGE_FORMAT_VALUE_KEY]: imageFormat,
	};
}

export const CreatePanelImageResultSchema = z.object({
	panelId: z.string(),
	comicId: z.string(),
	image: ResponsivePanelImageSchema,
	/** Set when one variant couldn't be made and the other was saved (REQ-103-3). */
	failedVariant: ImageVariantEnum.optional(),
	output: OpenAiOutputSchema.shape.output,
});
export type CreatePanelImageResult = z.infer<typeof CreatePanelImageResultSchema>;

export function decodeCreatePanelImageValues(formData: FormData) {
	return {
		panel: readJsonField(formData, 'panel'),
		comicId: readString(formData, 'comicId'),
		style: readString(formData, 'style'),
		characters: readJsonField(formData, 'characters'),
		[INSTRUCTIONS_VALUE_KEY]: readString(formData, INSTRUCTIONS_VALUE_KEY),
		[GLOBAL_INSTRUCTIONS_VALUE_KEY]: decodeGlobalInstructions(formData),
		[IMAGE_VALUE_KEY]: readString(formData, IMAGE_VALUE_KEY),
		[INCLUDE_IMAGE_VALUE_KEY]: readCheckbox(formData, INCLUDE_IMAGE_VALUE_KEY),
		[REFERENCE_IMAGES_KEY]: readStringList(formData, REFERENCE_IMAGES_KEY),
		[IMAGE_FORMAT_VALUE_KEY]: readString(formData, IMAGE_FORMAT_VALUE_KEY),
	};
}
