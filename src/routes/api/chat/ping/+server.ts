import { test } from '$lib/utils/ai/ai';

export const GET = async ({ cookies }) => {
	const success = await test(cookies);

	return new Response(JSON.stringify({ success }), {
		status: 200,
	});
};
