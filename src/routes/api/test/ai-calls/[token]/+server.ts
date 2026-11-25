import { getAiCallRecord } from '#lib/server/ai/mock-gateway.ts';
import { usesMockGateway } from '#lib/server/ai/gateway.ts';
import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

/**
 * Test-only: what the mock gateway recorded for one token (REQ-315-1). It answers 404
 * unless the mock gateway is active, so production never exposes it.
 */
export const GET: RequestHandler = ({ params }) => {
	if (!usesMockGateway()) {
		error(404, 'Not Found');
	}

	return json(getAiCallRecord(params.token));
};
