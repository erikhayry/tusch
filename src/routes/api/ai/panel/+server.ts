import { text } from '$lib/utils/ai/sdk/openAi';
import { json } from '@sveltejs/kit';

export const POST = async ({ request, cookies }) => {
	const { messagesJsonString, schemaName } = await request.json();
	const result = await text(cookies, JSON.parse(messagesJsonString), schemaName);

	return json(result);
};
