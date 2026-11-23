import { CreatePanelValuesSchema } from '#lib/features/panels/contracts/createPanel.ts';
import { generationEndpoint } from '#lib/server/actions/generation-endpoints.ts';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = ({ request }) =>
	generationEndpoint(request, CreatePanelValuesSchema, (generation, values) =>
		generation.createPanel(values),
	);
