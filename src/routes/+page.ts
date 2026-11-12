import { resolve } from '$app/paths';
import { bootstrapComics } from '$lib/features/comics/client/bootstrap';
import { getComics } from '$lib/features/comics/client/comic-selectors';
import { comicStore } from '$lib/features/comics/client/comic-store.svelte';
import { ComicsPageDataSchema } from '$lib/types/routeData';
import { redirect } from '@sveltejs/kit';
import { z } from 'zod';

export const ssr = false;

export type Props = z.infer<typeof ComicsPageDataSchema>;

export function load() {
	bootstrapComics();
	const comics = getComics(comicStore.comics);

	if (comics.length === 0) {
		throw redirect(307, resolve('/comic/create'));
	}

	return ComicsPageDataSchema.parse({ comics });
}
