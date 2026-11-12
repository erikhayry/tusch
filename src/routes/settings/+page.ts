import { IMAGE_MODEL_KEY, TEXT_MODEL_KEY } from '$lib/types';
import {
	SettingsRouteDataSchema,
	type SettingsRouteData,
} from '$lib/features/settings/contracts/settingsPage';
import { AiModelsResponseSchema } from '$lib/types/routeData';

export type Props = SettingsRouteData;

export async function load({ fetch, data }): Promise<Props> {
	const response = await fetch('/api/ai/models');
	// Without a working key there are no models to list yet; the page must still
	// render so the key can be entered.
	const models = response.ok ? AiModelsResponseSchema.parse(await response.json()) : { data: [] };
	const modelIds = models.data.map(({ id }) => id);

	return SettingsRouteDataSchema.parse({
		[TEXT_MODEL_KEY]: modelIds.filter((id) => !id.includes('image')),
		[IMAGE_MODEL_KEY]: modelIds.filter((id) => id.includes('image')),
		config: data.config,
	});
}
