import { createPanel } from '$lib/utils/ai/ai';
import { json } from '@sveltejs/kit';

export async function POST({ request, cookies }) {
	const data = await request.json();
	const { panelsJsonString, index } = data;

	try {
		const panel = await createPanel(index, JSON.parse(panelsJsonString), cookies);

		return json({
			...panel,
			index,
		});
	} catch (e) {
		console.error(e);
	}
}
