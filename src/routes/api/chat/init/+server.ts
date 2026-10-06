import { initComic } from '$lib/utils/ai/ai';

export async function POST({ request }) {
	const data = await request.json();
	const comic = await initComic(data.url?.toString() ?? '');

	return new Response(JSON.stringify(comic), { status: 200 });
}
