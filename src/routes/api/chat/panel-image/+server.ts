import { PanelSchemaJson } from '$lib/types/utils/json.js';
import { createPanelImage } from '$lib/utils/ai/ai';
import { json } from '@sveltejs/kit';
import type { CreatePanelImageResponse } from './createImageApiTypes.js';

export async function POST({ request, cookies }) {
	try {
		const data = await request.json();
		const { panelJsonString, instructions, style, charactersJsonString, imageUrl } = data;

		const response: CreatePanelImageResponse = await createPanelImage({
			panel: PanelSchemaJson.parse(panelJsonString),
			instruction: instructions,
			style,
			charactersJson: charactersJsonString,
			cookies,
			imageUrl,
		});

		return json(response);
	} catch (error) {
		console.error(error);
	}
}
