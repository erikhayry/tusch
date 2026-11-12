import { CREATE_COMIC_ACTION } from '$lib/features/comics/contracts/createComic';
import { createComicAction } from '$lib/server/actions/generation-actions';
import type { Actions } from './$types';

export const actions = {
	[CREATE_COMIC_ACTION]: (event) => createComicAction(event),
} satisfies Actions;
