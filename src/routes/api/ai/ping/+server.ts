import { ping } from '$lib/utils/ai/sdk/openAi';
import { json } from '@sveltejs/kit';

export const POST = async ({ cookies }) => {
	return json(ping(cookies));
};
