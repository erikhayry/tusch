// The viewer shows the same comic as the editor page, so it reuses that load
// (the same parent() wait and 404 for a missing comic).
export { load } from '../+page';
export type { Data } from '../+page';
