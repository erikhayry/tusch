import { expect, test } from '@playwright/test';
import { gotoHydrated } from './gotoHydrated';
import { VIEWS } from './views';

/**
 * No view scrolls horizontally at 320 CSS px (WCAG 1.4.10). The raw view is
 * covered by the loop: its JSON must wrap or scroll inside its own box.
 */
test.describe('reflow at 320 px', { tag: '@REQ-040' }, () => {
	test.use({ viewport: { width: 320, height: 640 } });

	for (const [name, url] of Object.entries(VIEWS)) {
		test(name, async ({ page }) => {
			await gotoHydrated(page, url);
			await page.waitForLoadState('networkidle');
			const { scrollWidth, clientWidth } = await page.evaluate(() => ({
				scrollWidth: document.documentElement.scrollWidth,
				clientWidth: document.documentElement.clientWidth,
			}));
			expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
		});
	}
});
