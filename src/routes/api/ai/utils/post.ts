import { image, text } from '$lib/utils/ai/sdk/openAi';
import { json, type RequestEvent } from '@sveltejs/kit';

export const postImage = async ({ request, cookies }: RequestEvent) => {
	const { messagesJsonString, schemaName, size } = await request.json();

	const result = await image({
		cookies,
		messages: JSON.parse(messagesJsonString),
		schemaName,
		size,
	});

	return json(result);
};

export const postText = async ({ request, cookies }: RequestEvent) => {
	const { messagesJsonString, schemaName } = await request.json();

	const result = await text(cookies, JSON.parse(messagesJsonString), schemaName);

	return json(result);
};
