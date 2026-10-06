import { createPanel } from '$lib/utils/ai/ai';
import { getComic } from '$lib/utils/db/db.js';
import { json } from '@sveltejs/kit';

export async function POST({ request }) {
	const data = await request.json();
	const { comicId, index } = data;
	const panels = getComic(comicId)?.panels;

	if (!panels) {
		return new Response(JSON.stringify({ error: 'Panel not found' }), { status: 404 });
	}

	const panel = await createPanel(index, panels);

	return json({
		...panel,
		index,
	});
}
