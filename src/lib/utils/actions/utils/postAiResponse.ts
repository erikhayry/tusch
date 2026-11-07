import {
	AiRequestSchema,
	OpenAiOutputSchema,
	type AiRequest,
	type OpenAiOutput,
} from '$lib/utils/ai/aiTypes';
import { error, fail, isActionFailure, type ActionFailure, type RequestEvent } from '@sveltejs/kit';
import z from 'zod';
import type { ActionFailureData } from '../actions';

export function isFormFailure<T>(
	result: T | ActionFailure<ActionFailureData>,
): result is ActionFailure<ActionFailureData> {
	return isActionFailure(result);
}

function getPostRequestInit(body?: AiRequest) {
	if (body) {
		return {
			method: 'POST',
			body: JSON.stringify(AiRequestSchema.parse(body)),
			headers: {
				'Content-Type': 'application/json',
			},
		};
	}

	return undefined;
}

async function handleRequest<T, H>({
	api,
	event,
	values,
	getBody,
	onValues,
	handleResponse,
}: {
	api: string;
	event: RequestEvent;
	values: T;
	getBody?: (values: T) => AiRequest;
	onValues?: (event: RequestEvent, values: T) => void;
	handleResponse: (data: OpenAiOutput, values: T) => H;
}): Promise<H> {
	onValues?.(event, values);

	let response: Response;
	try {
		response = await event.fetch(api, getPostRequestInit(getBody?.(values)));
	} catch (e: unknown) {
		error(502, e instanceof Error ? e.message : 'AI request failed');
	}

	if (!response.ok) {
		const responseText = await response.text();
		error(response.status, responseText || 'AI request failed');
	}

	try {
		const responseJson = OpenAiOutputSchema.parse(await response.json());
		return handleResponse(responseJson, values);
	} catch (e: unknown) {
		error(502, e instanceof Error ? e.message : 'Invalid AI response');
	}
}

export async function fetchAiResponse<T, H>({
	api,
	event,
	values,
	getBody,
	onValues,
	handleResponse,
}: {
	api: string;
	event: RequestEvent;
	values: T;
	getBody?: (values: T) => AiRequest;
	onValues?: (event: RequestEvent, values: T) => void;
	handleResponse: (data: OpenAiOutput, values: T) => H;
}): Promise<H> {
	return handleRequest({
		api,
		event,
		values,
		getBody,
		onValues,
		handleResponse,
	});
}

export async function submitAiResponse<T extends z.ZodType, H>({
	api,
	event,
	decode,
	schema,
	getBody,
	onValues,
	handleResponse,
}: {
	api: string;
	event: RequestEvent;
	decode: (formData: FormData) => unknown;
	schema: T;
	getBody?: (values: z.output<T>) => AiRequest;
	onValues?: (event: RequestEvent, values: z.output<T>) => void;
	handleResponse: (data: OpenAiOutput, values: z.output<T>) => H;
}): Promise<H | ActionFailure<ActionFailureData>> {
	const formData = await event.request.formData();
	const result = schema.safeParse(decode(formData));

	if (!result.success) {
		return fail(400, {
			code: 'invalid_input',
			message: 'Submitted values are invalid',
			fieldErrors: z.flattenError(result.error).fieldErrors,
		});
	}

	return handleRequest({
		api,
		event,
		values: result.data,
		getBody,
		onValues,
		handleResponse,
	});
}
