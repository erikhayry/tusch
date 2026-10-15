import { image } from '$lib/utils/ai/sdk/openAi';
import { json } from '@sveltejs/kit';

export const POST = async ({ request, cookies }) => {
	const { messagesJsonString, schemaName, size } = await request.json();

	const result = await image({
		cookies,
		messages: JSON.parse(messagesJsonString),
		schemaName,
		size,
	});

	console.log(result);

	return json(result);
};
