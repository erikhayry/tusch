import { EXAMPLE_COMPLETE as EXAMPLE } from './examples';

const MISSING_ID = '00000000-0000-4000-8000-000000000000';

/**
 * Every view of the app, keyed by its screenshot name. The screenshot and
 * accessibility tests both visit these; a new view goes here.
 */
export const VIEWS = {
	landing: '/',
	create: '/comic/create',
	comic: `/comic/${EXAMPLE.id}`,
	panel: `/comic/${EXAMPLE.id}/${EXAMPLE.panels[0].id}`,
	raw: `/comic/${EXAMPLE.id}/raw`,
	'not-found': `/comic/${MISSING_ID}`,
	settings: '/settings',
} as const;
