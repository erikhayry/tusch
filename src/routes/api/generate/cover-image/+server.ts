import { CreateCoverImageValuesSchema } from '$lib/features/comics/contracts/createCoverImage';
import { generationEndpoint } from '$lib/server/actions/generation-endpoints';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = ({ request }) =>
	generationEndpoint(request, CreateCoverImageValuesSchema, (generation, values) =>
		generation.createCoverImage(values),
	);
