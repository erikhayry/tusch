import type { Comic } from '$lib/types/index.js';
import { createCoverImage, initComic } from '$lib/utils/ai/ai';
import { json } from '@sveltejs/kit';

export async function POST({ request, cookies }) {
	try {
		const data = await request.json();
		const { url, style } = data;
		const comic: Comic = await initComic(url.toString(), style, cookies);
		const cover = await createCoverImage({ comic, cookies });

		return json({
			...comic,
			cover,
		});
	} catch (error) {
		console.error(error);
	}
}
