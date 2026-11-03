import { ComicPageDataSchema, ComicRouteParamsSchema } from '$lib/types/routeData';
import { getComic } from '$lib/utils/db/db.svelte';
import { error } from '@sveltejs/kit';
import { z } from 'zod';

export const ssr = false;

export type Data = z.infer<typeof ComicPageDataSchema>;

export function load({ params }) {
	const parsedParams = ComicRouteParamsSchema.safeParse(params);
	if (!parsedParams.success) error(404, 'Comic not found');

	const comic = getComic(parsedParams.data.id);
	if (!comic) error(404, 'Comic not found');

	return ComicPageDataSchema.parse({ comic });
}
