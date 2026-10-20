import type { Model } from '$lib/types/index.js';
import { IMAGE_MODEL_KEY, TEXT_MODEL_KEY } from '$lib/types/index.js';

export interface Props {
	[TEXT_MODEL_KEY]: Model[];
	[IMAGE_MODEL_KEY]: Model[];
}

export async function load({ fetch }): Promise<Props> {
	const response = await fetch('/api/ai/models');
	const models = await response.json();

	return {
		[TEXT_MODEL_KEY]: models.data
			?.filter(({ id }: { id: string }) => !id.includes('image'))
			.map(({ id }: { id: string }) => id),
		[IMAGE_MODEL_KEY]: models.data
			?.filter(({ id }: { id: string }) => id.includes('image'))
			.map(({ id }: { id: string }) => id),
	};
}
