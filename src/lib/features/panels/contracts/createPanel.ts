import {
	GLOBAL_INSTRUCTIONS_VALUE_KEY,
	GlobalInstructionsSchema,
	decodeGlobalInstructions,
} from '$lib/features/settings/contracts/globalInstructions';
import { readInteger, readJsonField, readString } from '$lib/forms/form-data';
import { PanelSchema, type Panel } from '$lib/types';
import { OpenAiOutputSchema } from '$lib/utils/ai/aiTypes';
import z from 'zod';
import { PanelPromptSchema, toPanelPrompt } from '../../comics/contracts/prompts';

export const CREATE_PANEL_ACTION = 'create-panel' as const;

export const CreatePanelValuesSchema = z.object({
	comicId: z.string(),
	panels: z.array(PanelPromptSchema),
	index: z.number().int(),
	[GLOBAL_INSTRUCTIONS_VALUE_KEY]: GlobalInstructionsSchema,
});
export type CreatePanelValues = z.output<typeof CreatePanelValuesSchema>;

/** The global instructions are added by the form at submit time. */
export function toCreatePanelValues(
	comicId: string,
	panels: Panel[],
	index: number,
): Omit<CreatePanelValues, typeof GLOBAL_INSTRUCTIONS_VALUE_KEY> {
	return { comicId, index, panels: panels.map(toPanelPrompt) };
}

export const CreatePanelResultSchema = z.object({
	comicId: z.string(),
	index: z.number().int(),
	panel: PanelSchema,
	output: OpenAiOutputSchema.shape.output,
});
export type CreatePanelResult = z.infer<typeof CreatePanelResultSchema>;

export function decodeCreatePanelValues(formData: FormData) {
	return {
		comicId: readString(formData, 'comicId'),
		panels: readJsonField(formData, 'panels'),
		index: readInteger(formData, 'index'),
		[GLOBAL_INSTRUCTIONS_VALUE_KEY]: decodeGlobalInstructions(formData),
	};
}
