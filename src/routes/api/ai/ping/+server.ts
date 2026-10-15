import { ping } from '$lib/utils/ai/sdk/openAi';
import { json } from '@sveltejs/kit';

export const GET = async ({ cookies }) => {
	const result = await ping(cookies);

	return json(result);
};
