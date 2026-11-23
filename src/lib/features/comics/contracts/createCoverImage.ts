import {
	GLOBAL_INSTRUCTIONS_VALUE_KEY,
	GlobalInstructionsSchema,
	decodeGlobalInstructions,
} from '#lib/features/settings/contracts/globalInstructions.ts';
import { EXISTING_IMAGE_VALUE_KEY } from '#lib/features/panels/contracts/createPanelImage.ts';
import { readCheckbox, readJsonField, readString } from '#lib/forms/form-data.ts';
import {
	ComicSchema,
	ImageFormatEnum,
	ImageVariantEnum,
	ResponsivePanelImageSchema,
	type Comic,
} from '#lib/types/index.ts';
import { OpenAiOutputSchema } from '#lib/utils/ai/aiTypes.ts';
import {
	IMAGE_FORMAT_VALUE_KEY,
	IMAGE_VALUE_KEY,
	INCLUDE_IMAGE_VALUE_KEY,
	INSTRUCTIONS_VALUE_KEY,
} from '#lib/utils/db/dbTypes.ts';
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
	/** The variants to make (the comic's format, REQ-011). Optional for API callers, which get both. */
	[IMAGE_FORMAT_VALUE_KEY]: ImageFormatEnum.optional(),
	/** The variant the cover already has, as a data URL, when the request makes the missing other one (REQ-280-1). */
	[EXISTING_IMAGE_VALUE_KEY]: z.string().startsWith('data:image/').optional(),
});
export type CreateCoverImageValues = z.output<typeof CreateCoverImageValuesSchema>;

export const CreateCoverImageResultSchema = z.object({
	comicId: z.string(),
	image: ResponsivePanelImageSchema,
	/** Set when one variant couldn't be made and the other was saved (REQ-011). */
	failedVariant: ImageVariantEnum.optional(),
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
		[IMAGE_FORMAT_VALUE_KEY]: readString(formData, IMAGE_FORMAT_VALUE_KEY),
		[EXISTING_IMAGE_VALUE_KEY]: readString(formData, EXISTING_IMAGE_VALUE_KEY),
	};
}
