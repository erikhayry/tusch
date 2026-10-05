import { createImage } from '$lib/utils/ai/ai';
import { findPanel } from '$lib/utils/db/db.js';

export async function POST({ request }) {
	const data = await request.json();
	const { scene, panelId, comicId } = data;
	const panel = findPanel(comicId, panelId);

	if (!panel) {
		return new Response(JSON.stringify({ error: 'Panel not found' }), { status: 404 });
	}

	const response = await createImage(scene, panel);

	return new Response(JSON.stringify(response), { status: 200 });
}
