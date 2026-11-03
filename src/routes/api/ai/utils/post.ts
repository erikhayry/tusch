import { AiImageRequestSchema, AiTextRequestSchema } from '$lib/utils/ai/aiTypes';
import { image, text } from '$lib/utils/ai/sdk/openAi';
import { error, json, type RequestEvent } from '@sveltejs/kit';
import type z from 'zod';

async function parseRequestBody<T extends z.ZodType>(
	request: Request,
	schema: T,
): Promise<z.output<T>> {
	let payload: unknown;
	try {
		payload = await request.json();
	} catch {
		error(400, 'Request body must be valid JSON');
	}

	const result = schema.safeParse(payload);
	if (!result.success) error(400, result.error.message);

	return result.data;
}

export const postImage = async ({ request, cookies }: RequestEvent) => {
	const body = await parseRequestBody(request, AiImageRequestSchema);
	const result = await image({ cookies, ...body });

	return json(result);
};

export const postText = async ({ request, cookies }: RequestEvent) => {
	const body = await parseRequestBody(request, AiTextRequestSchema);
	const result = await text(cookies, body);

	return json(result);
};
