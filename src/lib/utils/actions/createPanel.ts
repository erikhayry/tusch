import { readInteger, readJsonField, readString } from '$lib/forms/form-data';
import { PanelArraySchema, PanelSchema } from '$lib/types';
import { getPanelFromOpenAiResponse } from '$lib/utils/ai/ai';
import {
	AiTextRequestSchema,
	OpenAiOutputSchema,
	SchemaName,
	type OpenAiOutput,
} from '$lib/utils/ai/aiTypes';
import { buildPanelMessages } from '$lib/utils/ai/utils/messages';
import { type RequestEvent } from '@sveltejs/kit';
import { z } from 'zod';
import type { ActionResult } from './actions';
import { fetchAiResponse, submitAiResponse } from './utils/postAiResponse';

export const CreatePanelValuesSchema = z.object({
	comicId: z.string(),
	panels: PanelArraySchema,
	index: z.number().int(),
});
export type CreatePanelValues = z.infer<typeof CreatePanelValuesSchema>;
export const CreatePanelResultSchema = z.object({
	comicId: z.string(),
	index: z.number().int(),
	panel: PanelSchema,
	output: OpenAiOutputSchema.shape.output,
});
export type CreatePanelResult = z.infer<typeof CreatePanelResultSchema>;

function decodeValues(formData: FormData) {
	return {
		comicId: readString(formData, 'comicId'),
		panels: readJsonField(formData, 'panels'),
		index: readInteger(formData, 'index'),
	};
}

function getBody({ panels, index }: CreatePanelValues) {
	return AiTextRequestSchema.parse({
		messages: buildPanelMessages(index, panels),
		schemaName: SchemaName.enum.createPanel,
	});
}

function handleResponse(responseJson: OpenAiOutput, { comicId, index }: CreatePanelValues) {
	const panel = getPanelFromOpenAiResponse(responseJson);

	return CreatePanelResultSchema.parse({
		comicId,
		index,
		panel,
		output: responseJson.output,
	});
}

export function fetchPanel(event: RequestEvent, values: CreatePanelValues) {
	return fetchAiResponse({
		api: '/api/ai/panel',
		event,
		values,
		getBody,
		handleResponse,
	});
}

export async function submitPanel(event: RequestEvent): ActionResult<CreatePanelResult> {
	return submitAiResponse({
		api: '/api/ai/panel',
		event,
		decode: decodeValues,
		schema: CreatePanelValuesSchema,
		getBody,
		handleResponse,
	});
}
