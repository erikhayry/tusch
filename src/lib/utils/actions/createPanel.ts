import {
	CreatePanelResultSchema,
	CreatePanelValuesSchema,
	decodeCreatePanelValues,
	type CreatePanelResult,
	type CreatePanelValues,
} from '$lib/features/panels/contracts/createPanel';
import { getPanelFromOpenAiResponse } from '$lib/utils/ai/ai';
import { AiTextRequestSchema, SchemaName, type OpenAiOutput } from '$lib/utils/ai/aiTypes';
import { buildPanelMessages } from '$lib/utils/ai/utils/messages';
import { type RequestEvent } from '@sveltejs/kit';
import type { ActionResult } from './actions';
import { fetchAiResponse, submitAiResponse } from './utils/postAiResponse';

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
		decode: decodeCreatePanelValues,
		schema: CreatePanelValuesSchema,
		getBody,
		handleResponse,
	});
}
