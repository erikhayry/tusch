import { m } from '$lib/paraglide/messages';
import { expect, test, type APIRequestContext, type Page } from '@playwright/test';
import { CreatePage as SettingsPage } from '../../../../../settings/test/utils/createPage';
import {
	errorRegion,
	NO_IMAGE,
	submitWithInstructions,
} from '../../../../../../tests/e2e/aiFailures';
import { createComicAtFirstPanel } from '../../../../../../tests/e2e/createdComic';
import { clearSentryEvents, serverEvents } from '../../../../../../tests/e2e/sentryStub';

// Runs in the `sentry` project (playwright.config.ts): a preview server whose
// Sentry DSN points at scripts/sentry-stub.mjs, so the real client reports to it.

const API_KEY = 'sk-proj-e2eSentryPrivacyKey0123456789';
const SECRET_INSTRUCTIONS = 'my-private-instructions-e2e';

const addImage = (page: Page) => page.getByRole('button', { name: m.addImage() });

/** A comic made through the UI with an API key saved, on its first panel. */
async function openPanelWithKey(page: Page) {
	const settings = await new SettingsPage(page).goto();
	await settings.submit(API_KEY);
	await expect(settings.successMessage).toBeVisible();
	await createComicAtFirstPanel(page);
}

async function reported(request: APIRequestContext, count: number) {
	await expect.poll(async () => (await serverEvents(request)).length).toBe(count);
	return JSON.stringify(await serverEvents(request));
}

test(
	'reports an invalid AI response once, without prompts or the API key',
	{ tag: ['@REQ-185-3', '@REQ-029'] },
	async ({ page, request }) => {
		await openPanelWithKey(page);
		await clearSentryEvents(request);

		await submitWithInstructions(page, addImage(page), `${NO_IMAGE} ${SECRET_INSTRUCTIONS}`);
		await expect(errorRegion(page).getByText(m.aiNoImage())).toBeVisible();

		const sent = await reported(request, 1);
		expect(sent).toContain('Invalid AI response');
		expect(sent).not.toContain(SECRET_INSTRUCTIONS);
		expect(sent).not.toContain(API_KEY);
	},
);

test(
	'reports an unexpected upstream failure and still shows the provider message',
	{ tag: ['@REQ-185-3', '@REQ-009'] },
	async ({ page, request }) => {
		await openPanelWithKey(page);
		await clearSentryEvents(request);

		await submitWithInstructions(
			page,
			addImage(page),
			`mock-error:upstream ${SECRET_INSTRUCTIONS}`,
		);

		await expect(errorRegion(page)).toContainText('AI provider request failed (HTTP 500): boom');
		const sent = await reported(request, 1);
		expect(sent).toContain('AI provider request failed (HTTP 500): boom');
		expect(sent).not.toContain(SECRET_INSTRUCTIONS);
		expect(sent).not.toContain(API_KEY);
	},
);

test.describe('expected failures are not reported', { tag: ['@REQ-185-3', '@REQ-009'] }, () => {
	for (const [kind, message] of [
		['auth', 'API key is invalid or rejected'],
		['rate-limit', 'AI provider rate limit reached, try again shortly'],
	] as const) {
		test(`${kind} shows its message and sends no event`, async ({ page, request }) => {
			await openPanelWithKey(page);
			await clearSentryEvents(request);

			await submitWithInstructions(page, addImage(page), `mock-error:${kind}`);
			await expect(errorRegion(page)).toContainText(message);
			// Events arrive in the order they were sent, so once the upstream failure
			// below has been reported, an earlier auth/rate-limit event would be there too.
			await submitWithInstructions(page, addImage(page), 'mock-error:upstream');
			await expect(errorRegion(page)).toContainText('boom');

			const sent = await reported(request, 1);
			expect(sent).toContain('boom');
			expect(sent).not.toContain(message);
		});
	}
});
