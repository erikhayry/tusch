import { expect, test } from '@playwright/test';
import { goto } from '../support/goto';
import { SettingsPage } from '../support/settingsPage';

const SECRET = 'sk-secret-never-exposed-4f9a';

// One test per page keeps each well inside the test timeout; every one saves the key through the UI first.
for (const url of ['/', '/settings', '/comic/create']) {
	test(
		`a saved key appears in no HTML, script-readable cookie, localStorage entry or response body of ${url}`,
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

			await goto(page, url);

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
