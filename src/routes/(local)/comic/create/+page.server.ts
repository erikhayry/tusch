import { CREATE_COMIC_ACTION } from '#lib/features/comics/contracts/createComic.ts';
import { createComicAction } from '#lib/server/actions/generation-actions.ts';
import type { Actions } from './$types';

export const actions = {
	[CREATE_COMIC_ACTION]: (event) => createComicAction(event),
} satisfies Actions;
