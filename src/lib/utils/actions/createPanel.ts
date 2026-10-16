import type { Panel } from '$lib/types';
import { getPanelFromOpenAiResponse } from '$lib/utils/ai/ai';
import { SchemaName, type OpenAiOutput } from '$lib/utils/ai/aiTypes';
import { buildPanelMessages } from '$lib/utils/ai/utils/messages';
import { type RequestEvent } from '@sveltejs/kit';
import { z } from 'zod';
import type { ActionResult } from './actions';
import type { ParsedValue } from './types';
import { postAiResponse, type ValidationResult } from './utils/postAiResponse';

export const CreatePanelValuesSchema = z.object({
	comicId: z.string(),
	panelsJsonString: z.string(),
	index: z.number().int(),
});
export type CreatePanelValues = z.infer<typeof CreatePanelValuesSchema>;
export type CreatePanelResult = { comicId: string; index: number; panel: Panel; output: unknown };

async function getValues(formData: FormData): ParsedValue<CreatePanelValues> {
	return CreatePanelValuesSchema.safeParse({
		comicId: formData.get('comicId'),
		panelsJsonString: formData.get('panelsJsonString'),
		index: Number.parseInt(formData.get('index')!.toString()),
	});
}

function getBody({ panelsJsonString, index }: CreatePanelValues) {
	const messagesJsonString = JSON.stringify(
		buildPanelMessages(index, JSON.parse(panelsJsonString)),
	);

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

export function fetchPanel(event: RequestEvent, values: ValidationResult<CreatePanelValues>) {
	return postAiResponse({ api: '/api/ai/panel', event, values, getBody, handleResponse });
}

export async function createPanel(event: RequestEvent): ActionResult<CreatePanelResult> {
	const values = await getValues(await event.request.formData());

	return fetchPanel(event, values);
}
