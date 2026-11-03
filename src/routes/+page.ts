import { resolve } from '$app/paths';
import { ComicsPageDataSchema } from '$lib/types/routeData';
import { getComics } from '$lib/utils/db/db.svelte';
import { redirect } from '@sveltejs/kit';
import { z } from 'zod';

export const ssr = false;

export type Props = z.infer<typeof ComicsPageDataSchema>;

export function load() {
	const comics = getComics();

	if (comics.length === 0) {
		throw redirect(307, resolve('/comic/create'));
	}

	return ComicsPageDataSchema.parse({ comics });
}
