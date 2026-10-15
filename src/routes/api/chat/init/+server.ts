import { createCoverImage, initComic } from '$lib/utils/ai/ai';
import { json } from '@sveltejs/kit';

export async function POST({ request, cookies }) {
	try {
		const data = await request.json();
		const { url, style } = data;
		const { comic, output: comicOutput } = await initComic(url.toString(), style, cookies);
		const { image, output: coverOutput } = await createCoverImage({ comic, cookies });

		return json({
			comic: {
				...comic,
				cover: image,
			},
			output: {
				comic: comicOutput,
				cover: coverOutput,
			},
		});
	} catch (error) {
		console.error(error);
	}
}
