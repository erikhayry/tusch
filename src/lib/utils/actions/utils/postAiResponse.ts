import type { OpenAiOutput } from '$lib/utils/ai/aiTypes';
import { error, type RequestEvent } from '@sveltejs/kit';
import { getPostRequestInit } from './getPostRequestInit';

export type ValidationResult<T> =
	{ success: true; data: T } | { success: false; error: { message: string } };

export async function postAiResponse<T, R extends ValidationResult<T>, H>({
	api,
	event,
	values,
	onValues,
	getBody,
	handleResponse,
}: {
	api: string;
	event: RequestEvent;
	values: R;
	getBody?: (values: T) => Record<string, unknown>;
	onValues?: (event: RequestEvent, values: T) => void;
	handleResponse: (data: OpenAiOutput, values: T) => H;
}): Promise<H | ReturnType<typeof error>> {
	if (!values.success) {
		return error(500, values.error);
	}

	onValues?.(event, values.data);

	try {
		const body = getBody?.(values.data);
		const response = await event.fetch(api, getPostRequestInit(body));
		const responseJson = await response.json();

		return handleResponse(responseJson, values.data);
	} catch (e: unknown) {
		return error(500, (e as Error).message);
	}
}
