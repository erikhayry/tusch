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
});
export type CreatePanelValues = z.infer<typeof CreatePanelValuesSchema>;

export function toCreatePanelValues(
	comicId: string,
	panels: Panel[],
	index: number,
): CreatePanelValues {
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
	};
}
