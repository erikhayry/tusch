import { m } from '$lib/paraglide/messages';
import { expect, test } from '@playwright/test';
import { EXAMPLES } from '../../../../../examples/examples';
import { gotoHydrated } from '../../../../../tests/e2e/gotoHydrated';

const EXAMPLE = EXAMPLES[0];
const PANEL = EXAMPLE.panels[0];
const CHARACTER = EXAMPLE.characters[0];

test(
	'lists the panels a character appears in and previews a crop',
	{ tag: '@REQ-014' },
	async ({ page }) => {
		// Give the panel a stored image with character positions (example images aren't in OPFS).
		await gotoHydrated(page, `/comic/${EXAMPLE.id}/${PANEL.id}`);
		await page.getByRole('button', { name: m.removeImage() }).click();
		await page.getByRole('button', { name: m.addImage() }).click();
		await expect(page.getByRole('img', { name: 'mock alt text' })).toBeVisible();

		await gotoHydrated(page, `/comic/${EXAMPLE.id}`);
		const panelsOfCharacter = page
			.getByRole('heading', { name: CHARACTER.name })
			.locator('xpath=following-sibling::ul[1]');
		const entry = panelsOfCharacter.getByRole('listitem').filter({ hasText: PANEL.editorialTitle });
		await expect(entry).toContainText('Is generated: true');

		await entry.getByRole('button', { name: 'create' }).click();

		await expect(entry.locator('img[src^="blob:"]')).toBeVisible();
	},
);
