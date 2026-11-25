import { CreateComicValuesSchema } from '#lib/features/comics/contracts/createComic.ts';
import { generationEndpoint } from '#lib/server/actions/generation-endpoints.ts';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = ({ request }) =>
	generationEndpoint(request, CreateComicValuesSchema, (generation, values, signal) =>
		generation.createComic(values, signal),
	);
