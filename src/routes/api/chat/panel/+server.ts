import { PanelArraySchemaJson } from '$lib/types/utils/json';
import { createPanel } from '$lib/utils/ai/ai';
import { json } from '@sveltejs/kit';

export async function POST({ request, cookies }) {
	try {
		const data = await request.json();
		const { panelsJsonString, index } = data;

		const panel = await createPanel(index, PanelArraySchemaJson.parse(panelsJsonString), cookies);

		return json(panel);
	} catch (e) {
		console.error(e);
	}
}
