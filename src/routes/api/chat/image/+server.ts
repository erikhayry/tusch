import { PanelSchema } from '$lib/types/index.js';
import { createImage } from '$lib/utils/ai/ai';
import { json } from '@sveltejs/kit';
import type { CreateImageResponse } from './createImageApiTypes.js';

export async function POST({ request, cookies }) {
	try {
		const data = await request.json();
		const { panelJsonString } = data;

		const response: CreateImageResponse = await createImage(
			PanelSchema.parse(panelJsonString),
			cookies,
		);

		return json(response);
	} catch (error) {
		console.error(error);
	}
}
