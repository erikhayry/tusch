import type { OpenAiOutput } from '$lib/utils/ai/aiTypes';
import { error, type RequestEvent } from '@sveltejs/kit';
import type z from 'zod';

function getPostRequestInit(body?: Record<string, unknown>) {
	if (body) {
		return {
			method: 'POST',
			body: JSON.stringify(body),
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
): Promise<{ success: true; data: z.output<T> } | { success: false; error: z.ZodError }> {
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
	getBody?: (values: T) => Record<string, unknown>;
	onValues?: (event: RequestEvent, values: T) => void;
	handleResponse: (data: OpenAiOutput, values: T) => H;
}): Promise<H | ReturnType<typeof error>> {
	onValues?.(event, values);

	try {
		const body = getBody?.(values);
		const response = await event.fetch(api, getPostRequestInit(body));
		const responseJson = await response.json();

		return handleResponse(responseJson, values);
	} catch (e: unknown) {
		return error(500, (e as Error).message);
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
	getBody?: (values: T) => Record<string, unknown>;
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
	getBody?: (values: z.output<T>) => Record<string, unknown>;
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
