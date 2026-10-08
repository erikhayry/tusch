import { PanelSchema } from '$lib/types/index.js';
import { createImage } from '$lib/utils/ai/ai';
import { json } from '@sveltejs/kit';
import type { CreateImageResponse } from './createImageApiTypes.js';

export async function POST({ request, cookies }) {
	const panelJsonString = await request.json();

	if (!panelJsonString) {
		return new Response(JSON.stringify({ error: 'Panel not found' }), { status: 404 });
	}

	const response: CreateImageResponse = await createImage(
		PanelSchema.parse(panelJsonString),
		cookies,
	);

	return json(response);
}
