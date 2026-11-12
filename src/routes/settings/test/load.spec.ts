import { describe, expect, it, vi } from 'vitest';
import { load } from '../+page';

type LoadEvent = Parameters<typeof load>[0];

function event(response: Response): LoadEvent {
	return {
		fetch: vi.fn().mockResolvedValue(response),
		data: { config: {} },
	} as unknown as LoadEvent;
}

describe('settings load', () => {
	it('renders with empty model lists when no key is stored (models endpoint 401)', async () => {
		const result = await load(event(new Response('{"message":"Add a key"}', { status: 401 })));

		expect(result).toEqual({ textModel: [], imageModel: [], config: {} });
	});

	it('splits text and image models from the models endpoint', async () => {
		const body = JSON.stringify({ data: [{ id: 'gpt-x' }, { id: 'gpt-image-y' }] });

		const result = await load(event(new Response(body, { status: 200 })));

		expect(result).toMatchObject({ textModel: ['gpt-x'], imageModel: ['gpt-image-y'] });
	});
});
