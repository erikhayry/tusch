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
			// change the other tests or the web-vitals audit.
			command: `PLAYWRIGHT_TEST=true PUBLIC_SENTRY_DSN=${SENTRY_DSN} npm run preview -- --port ${SENTRY_APP_PORT} --strictPort`,
			port: SENTRY_APP_PORT,
			reuseExistingServer: true,
		},
	],
	timeout: 10000,
	// No retries: a flaky test is a bug to fix (scripts/check-e2e-stability.mjs enforces 0).
	retries: 0,
	// With several web servers Playwright no longer infers the base URL.
	use: { baseURL: 'http://localhost:4173', viewport: { width: 1280, height: 800 } },
	projects: [
		{
			name: 'default',
			// `e2e/` is the framework-agnostic suite that replaces the one under `src/`.
			testMatch: ['**/*.e2e.{ts,js}', 'e2e/**/*.e2e.ts'],
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
