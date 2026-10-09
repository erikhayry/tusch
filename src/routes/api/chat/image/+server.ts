import { PanelSchemaJson } from '$lib/types/utils/json.js';
import { createImage } from '$lib/utils/ai/ai';
import { json } from '@sveltejs/kit';
import type { CreateImageResponse } from './createImageApiTypes.js';

export async function POST({ request, cookies }) {
	try {
		const data = await request.json();
		const { panelJsonString, instructions, style } = data;

		const response: CreateImageResponse = await createImage(
			PanelSchemaJson.parse(panelJsonString),
			instructions,
			style,
			cookies,
		);

		return json(response);
	} catch (error) {
		console.error(error);
	}
}
