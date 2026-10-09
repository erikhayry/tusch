import { initComic } from '$lib/utils/ai/ai';
import { json } from '@sveltejs/kit';

export async function POST({ request, cookies }) {
	try {
		const data = await request.json();
		const { url, style } = data;
		const response = await initComic(url.toString(), style, cookies);

		return json(response);
	} catch (error) {
		console.error(error);
	}
}
