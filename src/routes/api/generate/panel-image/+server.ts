import { CreatePanelImageValuesSchema } from '$lib/features/panels/contracts/createPanelImage';
import { generationEndpoint } from '$lib/server/actions/generation-endpoints';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = (event) =>
	generationEndpoint(event, CreatePanelImageValuesSchema, (generation, values) =>
		generation.createPanelImage(values),
	);
