import { AiGatewayError } from '$lib/server/ai/ai-gateway';
import { isHttpError } from '@sveltejs/kit';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GET } from '../+server';

const { getAiGateway } = vi.hoisted(() => ({ getAiGateway: vi.fn() }));
vi.mock('$lib/server/ai/gateway', async (importOriginal) => ({
	...(await importOriginal<typeof import('$lib/server/ai/gateway')>()),
	getAiGateway,
}));

const callGet = () =>
	GET({ cookies: { get: vi.fn(), set: vi.fn() } } as unknown as Parameters<typeof GET>[0]);

function stubModels(models: () => Promise<string[]>) {
	getAiGateway.mockReturnValue({ models });
}

async function failure(): Promise<{ status: number; message: string }> {
	try {
		await callGet();
	} catch (thrown) {
		if (isHttpError(thrown)) return { status: thrown.status, message: thrown.body.message };
		throw thrown;
	}
	throw new Error('expected the route to throw');
}

describe('GET /api/ai/models', () => {
	beforeEach(() => getAiGateway.mockReset());

	it('returns the gateway model ids as { data: [{ id }] }', async () => {
		stubModels(async () => ['gpt-a', 'gpt-b']);
		const response = await callGet();
		expect(response.status).toBe(200);
		expect(await response.json()).toEqual({ data: [{ id: 'gpt-a' }, { id: 'gpt-b' }] });
	});

	it('maps a missing key to 401 with the gateway message', async () => {
		stubModels(async () => {
			throw new AiGatewayError('missing-key', 'No API key configured', 401);
		});
		expect(await failure()).toEqual({ status: 401, message: 'No API key configured' });
	});

	it('uses the provider status for other gateway failures', async () => {
		stubModels(async () => {
			throw new AiGatewayError('rate-limit', 'Slow down', 429);
		});
		expect(await failure()).toEqual({ status: 429, message: 'Slow down' });
	});

	it('falls back to 502 when the failure has no status', async () => {
		stubModels(async () => {
			throw new AiGatewayError('connection', 'Could not connect to the AI provider');
		});
		expect(await failure()).toEqual({
			status: 502,
			message: 'Could not connect to the AI provider',
		});
	});
});
