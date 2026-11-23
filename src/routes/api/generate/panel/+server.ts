import { CreatePanelValuesSchema } from '$lib/features/panels/contracts/createPanel';
import { generationEndpoint } from '$lib/server/actions/generation-endpoints';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = ({ request }) =>
	generationEndpoint(request, CreatePanelValuesSchema, (generation, values) =>
		generation.createPanel(values),
	);
