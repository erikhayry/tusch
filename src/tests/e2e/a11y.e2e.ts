import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { gotoHydrated } from './gotoHydrated';
import { VIEWS } from './views';

/**
 * axe scan of every view (docs/rules/testing.md, "Accessibility"). Any
 * violation fails, whatever its impact; the summary names the rule and nodes.
 */
test.describe('accessibility', { tag: '@REQ-035' }, () => {
	for (const [name, url] of Object.entries(VIEWS)) {
		test(name, async ({ page }) => {
			await gotoHydrated(page, url);
			await page.waitForLoadState('networkidle');
			const { violations } = await new AxeBuilder({ page }).analyze();
			const summary = violations.map(({ id, impact, nodes }) => ({
				id,
				impact,
				nodes: nodes.map((node) => node.target.join(' ')),
			}));
			expect(summary).toEqual([]);
		});
	}
});
