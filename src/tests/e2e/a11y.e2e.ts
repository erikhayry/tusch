import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { gotoHydrated } from './gotoHydrated';
import { VIEW_ACTIONS, VIEWS, type ViewName } from './views';

/**
 * axe scan of every view (docs/rules/testing.md, "Accessibility"). Any
 * violation fails, whatever its impact; the summary names the rule and nodes.
 */
function scanEveryView() {
	for (const name of Object.keys(VIEWS) as ViewName[]) {
		test(name, async ({ page }) => {
			await gotoHydrated(page, VIEWS[name]);
			await page.waitForLoadState('networkidle');
			// Run after the page settles: a held request keeps the network busy for good.
			await VIEW_ACTIONS[name]?.(page);
			const { violations } = await new AxeBuilder({ page }).analyze();
			const summary = violations.map(({ id, impact, nodes }) => ({
				id,
				impact,
				nodes: nodes.map((node) => node.target.join(' ')),
			}));
			expect(summary).toEqual([]);
		});
	}
}

test.describe('accessibility', { tag: '@REQ-035' }, scanEveryView);

test.describe('accessibility in the dark colour scheme', { tag: '@REQ-035' }, () => {
	test.use({ colorScheme: 'dark' });
	scanEveryView();
});
