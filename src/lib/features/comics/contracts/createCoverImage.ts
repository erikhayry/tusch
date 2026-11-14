import {
	GLOBAL_INSTRUCTIONS_VALUE_KEY,
	GlobalInstructionsSchema,
	decodeGlobalInstructions,
} from '$lib/features/settings/contracts/globalInstructions';
import { readCheckbox, readJsonField, readString } from '$lib/forms/form-data';
import { ComicSchema, ResponsiveImageSchema, type Comic } from '$lib/types';
import { OpenAiOutputSchema } from '$lib/utils/ai/aiTypes';
import {
	IMAGE_VALUE_KEY,
	INCLUDE_IMAGE_VALUE_KEY,
	INSTRUCTIONS_VALUE_KEY,
} from '$lib/utils/db/dbTypes';
import z from 'zod';
import {
	CharacterPromptSchema,
	PanelPromptSchema,
	toCharacterPrompt,
	toPanelPrompt,
} from './prompts';

export const CREATE_COVER_IMAGE_ACTION = 'create-cover-image' as const;

export const CoverPromptSchema = ComicSchema.pick({ id: true, style: true }).extend({
	characters: z.array(CharacterPromptSchema),
	panels: z.array(PanelPromptSchema),
});
export type CoverPrompt = z.infer<typeof CoverPromptSchema>;

export function toCoverPrompt(comic: Comic): CoverPrompt {
	return {
		id: comic.id,
		style: comic.style,
		characters: comic.characters.map(toCharacterPrompt),
		panels: comic.panels.map(toPanelPrompt),
	};
}

export const CreateCoverImageValuesSchema = z.object({
	comic: CoverPromptSchema,
	[INSTRUCTIONS_VALUE_KEY]: z.string(),
	[GLOBAL_INSTRUCTIONS_VALUE_KEY]: GlobalInstructionsSchema,
	[IMAGE_VALUE_KEY]: z.string().optional(),
	[INCLUDE_IMAGE_VALUE_KEY]: z.boolean().optional(),
});
export type CreateCoverImageValues = z.output<typeof CreateCoverImageValuesSchema>;

export const CreateCoverImageResultSchema = z.object({
	comicId: z.string(),
	image: ResponsiveImageSchema,
	output: OpenAiOutputSchema.shape.output,
});
export type CreateCoverImageResult = z.infer<typeof CreateCoverImageResultSchema>;

export function decodeCreateCoverImageValues(formData: FormData) {
	return {
		comic: readJsonField(formData, 'comic'),
		[INSTRUCTIONS_VALUE_KEY]: readString(formData, INSTRUCTIONS_VALUE_KEY),
		[GLOBAL_INSTRUCTIONS_VALUE_KEY]: decodeGlobalInstructions(formData),
		[IMAGE_VALUE_KEY]: readString(formData, IMAGE_VALUE_KEY),
		[INCLUDE_IMAGE_VALUE_KEY]: readCheckbox(formData, INCLUDE_IMAGE_VALUE_KEY),
	};
}
