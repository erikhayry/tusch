import { defineConfig } from '@playwright/test';

export default defineConfig({
	webServer: {
		command: 'PLAYWRIGHT_TEST=true npm run build && PLAYWRIGHT_TEST=true npm run preview',
		port: 4173,
		reuseExistingServer: true,
	},
	timeout: 10000,
	testMatch: '**/*.e2e.{ts,js}',
});
