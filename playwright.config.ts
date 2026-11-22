import { defineConfig } from '@playwright/test';
import { SENTRY_APP_PORT, SENTRY_DSN, SENTRY_STUB_PORT } from './src/tests/e2e/sentryStub';

const SENTRY_TESTS = /sentryReports\.svelte\.e2e\.ts$/;

export default defineConfig({
	// Started in order: the first builds, the last previews that build with a DSN.
	webServer: [
		{
			command: 'PLAYWRIGHT_TEST=true npm run build && PLAYWRIGHT_TEST=true npm run preview',
			port: 4173,
			reuseExistingServer: true,
		},
		{
			command: `node scripts/sentry-stub.mjs ${SENTRY_STUB_PORT}`,
			url: `http://localhost:${SENTRY_STUB_PORT}/events`,
			reuseExistingServer: true,
		},
		{
			// Only the Sentry project talks to this server, so enabling Sentry here can't
			// change the other tests, the screenshots or the web-vitals audit.
			command: `PLAYWRIGHT_TEST=true PUBLIC_SENTRY_DSN=${SENTRY_DSN} npm run preview -- --port ${SENTRY_APP_PORT} --strictPort`,
			port: SENTRY_APP_PORT,
			reuseExistingServer: true,
		},
	],
	timeout: 10000,
	// Baselines are Linux-only (CI container), so drop the platform suffix.
	snapshotPathTemplate: '{testDir}/{testFileDir}/__screenshots__/{arg}{ext}',
	expect: {
		toHaveScreenshot: { animations: 'disabled', caret: 'hide', maxDiffPixelRatio: 0.001 },
	},
	// With several web servers Playwright no longer infers the base URL.
	use: { baseURL: 'http://localhost:4173', viewport: { width: 1280, height: 800 } },
	projects: [
		{
			name: 'default',
			testMatch: '**/*.e2e.{ts,js}',
			testIgnore: SENTRY_TESTS,
		},
		{
			// One file, one worker at a time: the stub's event list is shared by its tests.
			name: 'sentry',
			testMatch: SENTRY_TESTS,
			use: { baseURL: `http://localhost:${SENTRY_APP_PORT}` },
		},
	],
});
