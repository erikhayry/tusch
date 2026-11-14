import type { APIRequestContext } from '@playwright/test';

/** `scripts/sentry-stub.mjs` receives what the app's server would send to Sentry. */
export const SENTRY_STUB_PORT = 4174;
/** A second preview server of the same build, with a DSN pointing at the stub. */
export const SENTRY_APP_PORT = 4175;
export const SENTRY_DSN = `http://public@localhost:${SENTRY_STUB_PORT}/1`;

const EVENTS_URL = `http://localhost:${SENTRY_STUB_PORT}/events`;

export type CapturedEvent = Record<string, unknown>;

/** Events reported by the server; the browser SDK shares the DSN, so filter on platform. */
export async function serverEvents(request: APIRequestContext): Promise<CapturedEvent[]> {
	const response = await request.get(EVENTS_URL);
	const events: CapturedEvent[] = await response.json();
	return events.filter((event) => event.platform === 'node');
}

export async function clearSentryEvents(request: APIRequestContext): Promise<void> {
	await request.delete(EVENTS_URL);
}
