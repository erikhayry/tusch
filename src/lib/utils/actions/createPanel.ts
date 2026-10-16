import { PanelArraySchema, type Panel } from '$lib/types';
import { getPanelFromOpenAiResponse } from '$lib/utils/ai/ai';
import { SchemaName, type OpenAiOutput } from '$lib/utils/ai/aiTypes';
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
export type CreatePanelResult = { comicId: string; index: number; panel: Panel; output: unknown };

function getBody({ panels, index }: CreatePanelValues) {
	const messagesJsonString = JSON.stringify(buildPanelMessages(index, panels));

	return {
		messagesJsonString,
		schemaName: SchemaName.enum.createPanel,
	};
}

function handleResponse(responseJson: OpenAiOutput, { comicId, index }: CreatePanelValues) {
	const panel = getPanelFromOpenAiResponse(responseJson);

	return {
		comicId,
		index,
		panel,
		output: responseJson.output,
	};
}

export function fetchPanel(event: RequestEvent, values: CreatePanelValues) {
	return fetchAiResponse({
		api: '/api/ai/cover-image',
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
		schema: CreatePanelValuesSchema,
		getBody,
		handleResponse,
	});
}
