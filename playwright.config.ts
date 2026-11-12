import { defineConfig } from '@playwright/test';

export default defineConfig({
	webServer: {
		command: 'PLAYWRIGHT_TEST=true npm run build && PLAYWRIGHT_TEST=true npm run preview',
		port: 4173,
		reuseExistingServer: true,
	},
	timeout: 10000,
	// Baselines are Linux-only (CI container), so drop the platform suffix.
	snapshotPathTemplate: '{testDir}/{testFileDir}/__screenshots__/{arg}{ext}',
	expect: {
		toHaveScreenshot: { animations: 'disabled', caret: 'hide', maxDiffPixelRatio: 0.001 },
	},
	use: { viewport: { width: 1280, height: 800 } },
	testMatch: '**/*.e2e.{ts,js}',
});
