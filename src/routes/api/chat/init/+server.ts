import { initOpenAi } from '$lib/utils/ai/ai';

export async function POST({ request }) {
	const data = await request.json();
	const comic = await initOpenAi(data.url?.toString() ?? '');

	return new Response(JSON.stringify(comic), { status: 200 });
}
