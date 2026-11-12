import { getComic } from '$lib/features/comics/client/comic-selectors';
import { comicStore } from '$lib/features/comics/client/comic-store.svelte';
import { ComicPageDataSchema, ComicRouteParamsSchema } from '$lib/types/routeData';
import { error } from '@sveltejs/kit';
import { z } from 'zod';

export type Data = z.infer<typeof ComicPageDataSchema>;

export async function load({ params, parent }) {
	await parent();
	const parsedParams = ComicRouteParamsSchema.safeParse(params);
	if (!parsedParams.success) error(404, 'Comic not found');

	const comic = getComic(comicStore.comics, parsedParams.data.id);
	if (!comic) error(404, 'Comic not found');

	return ComicPageDataSchema.parse({ comic });
}
