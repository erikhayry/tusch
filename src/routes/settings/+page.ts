import { IMAGE_MODEL_KEY, TEXT_MODEL_KEY } from '$lib/types';
import { AiModelsResponseSchema, SettingsPageDataSchema } from '$lib/types/routeData';
import { z } from 'zod';

export type Props = z.infer<typeof SettingsPageDataSchema>;

export async function load({ fetch }): Promise<Props> {
	const response = await fetch('/api/ai/models');
	// Without a working key there are no models to list yet; the page must still
	// render so the key can be entered.
	const models = response.ok ? AiModelsResponseSchema.parse(await response.json()) : { data: [] };
	const modelIds = models.data.map(({ id }) => id);

	return SettingsPageDataSchema.parse({
		[TEXT_MODEL_KEY]: modelIds.filter((id) => !id.includes('image')),
		[IMAGE_MODEL_KEY]: modelIds.filter((id) => id.includes('image')),
	});
}
