import { resolve } from '$app/paths';
import { getComics, hasOnlyExampleComics } from '#lib/features/comics/client/comic-selectors.ts';
import { comicStore } from '#lib/features/comics/client/comic-store.svelte.ts';
import { ComicsPageDataSchema } from '#lib/types/routeData.ts';
import { redirect } from '@sveltejs/kit';
import { z } from 'zod';

export type Props = z.infer<typeof ComicsPageDataSchema>;

export async function load({ parent, data }) {
	await parent();
	const comics = getComics(comicStore.comics);

	// Empty collection (e.g. every comic deleted this session): start a new one.
	if (comics.length === 0) {
		redirect(307, resolve('comic/create'));
	}

	return ComicsPageDataSchema.parse({
		comics,
		hasKey: data.hasKey,
		showWelcome: !data.hasKey && hasOnlyExampleComics(comics),
	});
}
