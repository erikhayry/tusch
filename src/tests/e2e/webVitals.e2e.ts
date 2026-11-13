import { expect, test } from '@playwright/test';
import { checkWebVitals } from './webVitals/audit';

/**
 * Lighthouse web vitals budget (docs/rules/testing.md, "Performance").
 * Locally skipped unless PLAYWRIGHT_WEB_VITALS=1; always runs in CI.
 */
test.skip(
	!process.env.CI && process.env.PLAYWRIGHT_WEB_VITALS !== '1',
	'Web vitals run in CI; set PLAYWRIGHT_WEB_VITALS=1 to run locally',
);

// Lighthouse runs 3 times per view, one after another.
test.setTimeout(10 * 60 * 1000);

test('landing, comic and panel meet the web vitals budget', { tag: ['@REQ-039'] }, async () => {
	const violations = await checkWebVitals({ views: ['landing', 'comic', 'panel'], runs: 3 });
	expect(violations).toEqual([]);
});

test(
	'an unmeetable budget fails and names the view and metric',
	{ tag: ['@REQ-039'] },
	async () => {
		const violations = await checkWebVitals({ views: ['landing'], runs: 1, budget: { lcp: 1 } });
		expect(violations).toEqual([
			expect.objectContaining({ view: 'landing', metric: 'lcp', limit: 1 }),
		]);
	},
);
