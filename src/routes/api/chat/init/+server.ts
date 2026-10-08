import { initComic } from '$lib/utils/ai/ai';

export async function POST({ request, cookies }) {
	const data = await request.json();
	const comic = await initComic(data.url?.toString() ?? '', cookies);

	return new Response(JSON.stringify(comic), { status: 200 });
}
