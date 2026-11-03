import { AiModelsResponseSchema } from '$lib/types/routeData';
import { models } from '$lib/utils/ai/sdk/openAi.js';
import { json } from '@sveltejs/kit';

export const GET = async ({ cookies }) => {
	const modelsList = await models(cookies);
	const response = AiModelsResponseSchema.parse({
		data: modelsList.data.map(({ id }) => ({ id })),
	});

	return json(response);
};
