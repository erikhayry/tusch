import { bootstrapComics } from '$lib/features/comics/client/bootstrap';

/**
 * Browser-only boundary for every route that reads local comic state
 * (localStorage + OPFS). Declared once here instead of per page. Server
 * actions in `+page.server.ts` files still run on the server.
 */
export const ssr = false;

// Load persisted comics once, before any page load reads or writes them, so a
// command never commits on top of an unloaded store.
export function load() {
	bootstrapComics();
}
