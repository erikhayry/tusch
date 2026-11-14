import { readCheckbox, readJsonField, readString, readStringList } from '$lib/forms/form-data';
import type { Character } from '$lib/types';
import { ComicStyleEnum, PanelSchema, ResponsivePanelImageSchema, type Panel } from '$lib/types';
import { OpenAiOutputSchema } from '$lib/utils/ai/aiTypes';
import {
	IMAGE_VALUE_KEY,
	INCLUDE_IMAGE_VALUE_KEY,
	INSTRUCTIONS_VALUE_KEY,
} from '$lib/utils/db/dbTypes';
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
	[IMAGE_VALUE_KEY]: z.string().optional(),
	[INCLUDE_IMAGE_VALUE_KEY]: z.boolean().optional(),
	[REFERENCE_IMAGES_KEY]: z.array(z.string().startsWith('data:image/')).max(MAX_REFERENCE_IMAGES),
});
export type CreatePanelImageValues = z.infer<typeof CreatePanelImageValuesSchema>;

export function toCreatePanelImageValues(
	comicId: string,
	panel: Panel,
	characters: Character[],
	style: CreatePanelImageValues['style'],
): Pick<CreatePanelImageValues, 'comicId' | 'panel' | 'characters' | 'style'> {
	return {
		comicId,
		panel: toPanelImagePrompt(panel),
		characters: characters.map(toCharacterPrompt),
		style,
	};
}

export const CreatePanelImageResultSchema = z.object({
	panelId: z.string(),
	comicId: z.string(),
	image: ResponsivePanelImageSchema,
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
		[IMAGE_VALUE_KEY]: readString(formData, IMAGE_VALUE_KEY),
		[INCLUDE_IMAGE_VALUE_KEY]: readCheckbox(formData, INCLUDE_IMAGE_VALUE_KEY),
		[REFERENCE_IMAGES_KEY]: readStringList(formData, REFERENCE_IMAGES_KEY),
	};
}
