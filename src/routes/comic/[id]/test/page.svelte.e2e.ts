import { expect, test } from '@playwright/test';
import { ComicPropsMock1 } from '$lib/components/comic/test/utils/mockComic';

test('has expected title', async ({ page }) => {
	await page.goto('/comic/1');

	await expect(page.locator('h2')).toHaveAccessibleName(ComicPropsMock1.title);
});
