import { browser } from '$app/environment';
import { bootstrapComics } from '$lib/features/comics/client/bootstrap';

// Load persisted comics once for every route, including ones that only write
// (e.g. /comic/create), so a command never commits on top of an unloaded store.
export function load() {
	if (browser) bootstrapComics();
}
