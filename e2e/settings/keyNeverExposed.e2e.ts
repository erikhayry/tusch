import { expect, test, type Page } from '@playwright/test';
import { goto } from '../support/goto';
import { createComicViaUi } from '../support/createComicViaUi';
import { SettingsPage } from '../support/settingsPage';

const SECRET = 'sk-secret-never-exposed-4f9a';

/**
 * Each case opens one view after the key is saved. A created comic is included on purpose:
 * its page and its generation requests are what a real user sees, not only the examples.
 * One test per view keeps each well inside the test timeout.
 */
const VIEWS: { name: string; open: (page: Page) => Promise<unknown> }[] = [
	{ name: 'the start page', open: (page) => goto(page, '/') },
	{ name: 'the settings page', open: (page) => goto(page, '/settings') },
	{ name: 'the create comic page', open: (page) => goto(page, '/comic/create') },
	{ name: 'a comic the user created', open: (page) => createComicViaUi(page) },
];

for (const view of VIEWS) {
	test(
		`a saved key appears in no HTML, script-readable cookie, localStorage entry or response body of ${view.name}`,
		{ tag: '@REQ-029' },
		async ({ page, context }) => {
			// Every response body the browser fully receives, from before the key is submitted.
			// Only finished requests: `text()` on a still-open response would wait for it.
			const bodies: Promise<string>[] = [];
			page.on('requestfinished', (request) => {
				bodies.push(
					request
						.response()
						.then((response) => response?.text() ?? '')
						.catch(() => ''),
				);
			});
			const settings = await new SettingsPage(page).goto();
			await settings.saveKey(SECRET);
			await expect(settings.keySavedMessage).toBeVisible();

			await view.open(page);

			expect(await page.content()).not.toContain(SECRET);
			expect(await page.evaluate(() => document.cookie)).not.toContain(SECRET);
			expect(await page.evaluate(() => JSON.stringify({ ...localStorage }))).not.toContain(SECRET);
			// The key is stored, but only where scripts can't read it.
			const keyCookies = (await context.cookies()).filter(({ value }) =>
				decodeURIComponent(value).includes(SECRET),
			);
			expect(keyCookies).toHaveLength(1);
			expect(keyCookies.every(({ httpOnly }) => httpOnly)).toBe(true);

			const received = await Promise.all(bodies);
			expect(received.length).toBeGreaterThan(0);
			for (const body of received) {
				expect(body).not.toContain(SECRET);
			}
		},
	);
}
