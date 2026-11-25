import { expect, type Page } from '@playwright/test';
import { randomUUID } from 'node:crypto';

/** What the mock gateway recorded for one token (`docs/rules/testing.md`, REQ-315-1). */
export type AiCallRecord = { calls: number; aborts: number };

/**
 * A fresh token per test: tests run in parallel against one server, so each reads only
 * its own request's record.
 */
export const newToken = () => randomUUID().slice(0, 8);

/**
 * The image call waits until the browser aborts the request (60 s cap) and records the
 * abort. Put it in the form's instructions.
 */
export const holdMarker = (token: string) => `mock-error:hold-${token}`;

/** Like `holdMarker` but answers at once: records the calls, never an abort. */
export const recordMarker = (token: string) => `mock-error:record-${token}`;

/** Test-only endpoint: 404 unless `PLAYWRIGHT_TEST`. */
const recordUrl = (token: string) => `/api/test/ai-calls/${token}`;

export async function aiCalls(page: Page, token: string): Promise<AiCallRecord> {
	const response = await page.request.get(recordUrl(token));
	expect(response.status()).toBe(200);
	return (await response.json()) as AiCallRecord;
}

/** Wait until the server's mock image call for this token has started. */
export async function expectCallReachedServer(page: Page, token: string, calls = 1) {
	await expect.poll(async () => (await aiCalls(page, token)).calls).toBe(calls);
}
