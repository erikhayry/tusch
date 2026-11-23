import { CreateCoverImageValuesSchema } from '#lib/features/comics/contracts/createCoverImage.ts';
import { generationEndpoint } from '#lib/server/actions/generation-endpoints.ts';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = ({ request }) =>
	generationEndpoint(request, CreateCoverImageValuesSchema, (generation, values) =>
		generation.createCoverImage(values),
	);
