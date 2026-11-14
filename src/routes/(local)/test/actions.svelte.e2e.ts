import { expect, test, type APIRequestContext } from '@playwright/test';
import { EXAMPLE_COMPLETE as EXAMPLE } from '../../../tests/e2e/examples';

const ORIGIN = 'http://localhost:4173';

/** POST a form action the way `use:enhance` does and return SvelteKit's result. */
async function postAction(request: APIRequestContext, path: string, action: string) {
	const response = await request.post(`${path}?/${action}`, {
		headers: { origin: ORIGIN, 'x-sveltekit-action': 'true', accept: 'application/json' },
		form: { probe: '1' },
	});
	return (await response.json()) as { type: string; error?: { message: string } };
}

const ROUTES = [
	{ path: '/', exposed: ['client'], hidden: ['create-comic', 'byok'] },
	{ path: '/comic/create', exposed: ['create-comic'], hidden: ['client', 'create-panel'] },
	{
		path: `/comic/${EXAMPLE.id}`,
		exposed: ['create-cover-image', 'client'],
		hidden: ['create-panel', 'config'],
	},
	{
		path: `/comic/${EXAMPLE.id}/${EXAMPLE.panels[0].id}`,
		exposed: ['create-panel', 'create-panel-image', 'client'],
		hidden: ['create-comic', 'create-cover-image'],
	},
	{ path: '/settings', exposed: ['byok', 'config'], hidden: ['client', 'create-comic'] },
];

test.describe('route action maps', { tag: '@REQ-033' }, () => {
	for (const { path, exposed, hidden } of ROUTES) {
		test(`${path} exposes only its own actions`, async ({ request }) => {
			for (const action of exposed) {
				const result = await postAction(request, path, action);
				expect(result.error?.message, `${path} should handle ?/${action}`).not.toBe('Not Found');
			}
			for (const action of hidden) {
				const result = await postAction(request, path, action);
				expect(result, `${path} must not expose ?/${action}`).toMatchObject({
					type: 'error',
					error: { message: 'Not Found' },
				});
			}
		});
	}
});
