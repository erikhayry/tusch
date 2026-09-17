import { ComicsMock } from '$lib/types/test/utils/mockTypes';
import { expect, test } from '@playwright/test';

test('has expected title', async ({ page }) => {
	await page.goto('/comic/1');

	await expect(page.locator('h2')).toHaveAccessibleName(ComicsMock[0].title);
});
