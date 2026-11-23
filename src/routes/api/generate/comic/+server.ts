import { CreateComicValuesSchema } from '$lib/features/comics/contracts/createComic';
import { generationEndpoint } from '$lib/server/actions/generation-endpoints';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = ({ request }) =>
	generationEndpoint(request, CreateComicValuesSchema, (generation, values) =>
		generation.createComic(values),
	);
