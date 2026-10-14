import { ComicSchemaJson } from '$lib/types/utils/json.js';
import { createCoverImage } from '$lib/utils/ai/ai';
import { json } from '@sveltejs/kit';
import type { CreateCoverImageResponse } from './createCoverImageApiTypes.js';

export async function POST({ request, cookies }) {
	try {
		const data = await request.json();
		const { comicJsonString } = data;

		const response: CreateCoverImageResponse = await createCoverImage({
			comic: ComicSchemaJson.parse(comicJsonString),
			cookies,
		});

		return json(response);
	} catch (error) {
		console.error(error);
	}
}
