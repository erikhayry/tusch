import {
	AiRequestSchema,
	OpenAiOutputSchema,
	type AiRequest,
	type OpenAiOutput,
} from '$lib/utils/ai/aiTypes';
import { error, type RequestEvent } from '@sveltejs/kit';
import type z from 'zod';

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

function parseJsonValues(formData: FormData) {
	return Object.fromEntries(
		Array.from(formData.entries()).map(([key, value]) => {
			if (typeof value !== 'string') return [key, value];
			try {
				return [key, JSON.parse(value)];
			} catch {
				return [key, value];
			}
		}),
	);
}

async function getValues<T extends z.ZodType>(
	formData: FormData,
	schema: T,
): Promise<z.ZodSafeParseResult<z.output<T>>> {
	return schema.safeParse(parseJsonValues(formData));
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
}): Promise<H | ReturnType<typeof error>> {
	onValues?.(event, values);

	let response: Response;
	try {
		response = await event.fetch(api, getPostRequestInit(getBody?.(values)));
	} catch (e: unknown) {
		return error(502, e instanceof Error ? e.message : 'AI request failed');
	}

	if (!response.ok) {
		const responseText = await response.text();
		return error(response.status, responseText || 'AI request failed');
	}

	try {
		const responseJson = OpenAiOutputSchema.parse(await response.json());
		return handleResponse(responseJson, values);
	} catch (e: unknown) {
		return error(502, e instanceof Error ? e.message : 'Invalid AI response');
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
}): Promise<H | ReturnType<typeof error>> {
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
	schema,
	getBody,
	onValues,
	handleResponse,
}: {
	api: string;
	event: RequestEvent;
	schema: T;
	getBody?: (values: z.output<T>) => AiRequest;
	onValues?: (event: RequestEvent, values: z.output<T>) => void;
	handleResponse: (data: OpenAiOutput, values: z.output<T>) => H;
}): Promise<H | ReturnType<typeof error>> {
	const formData = await event.request.formData();
	const result = await getValues(formData, schema);

	if (!result.success) {
		return error(500, result.error);
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
