import { createImage } from '$lib/utils/ai/ai';
import { getPanel } from '$lib/utils/db/db.js';
import { json } from '@sveltejs/kit';
import type { CreateImageResponse } from './createImageApiTypes.js';

export async function POST({ request }) {
	const data = await request.json();
	const { scene, panelId, comicId } = data;
	const panel = getPanel(comicId, panelId);

	if (!panel) {
		return new Response(JSON.stringify({ error: 'Panel not found' }), { status: 404 });
	}

	const response: CreateImageResponse = await createImage(scene, panel);

	return json(response);
}
