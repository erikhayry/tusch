import { CreatePanelImageValuesSchema } from '#lib/features/panels/contracts/createPanelImage.ts';
import { generationEndpoint } from '#lib/server/actions/generation-endpoints.ts';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = ({ request }) =>
	generationEndpoint(request, CreatePanelImageValuesSchema, (generation, values, signal) =>
		generation.createPanelImage(values, signal),
	);
