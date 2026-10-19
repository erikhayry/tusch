import type { Model } from '$lib/types/index.js';

export interface Props {
	models: Model[];
}

export async function load({ fetch }): Promise<Props> {
	const response = await fetch('/api/ai/models');
	const models = await response.json();

	return {
		models: models.data.map(({ id }) => id),
	};
}
