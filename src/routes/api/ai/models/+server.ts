import { models } from '$lib/utils/ai/sdk/openAi.js';
import { json } from '@sveltejs/kit';

export const GET = async ({ cookies }) => {
	const modelsList = await models(cookies);

	return json(modelsList);
};
