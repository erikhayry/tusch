import { m } from '$lib/paraglide/messages';
import { expect, test } from '@playwright/test';
import { EXAMPLES } from '../../../../../examples/examples';
import { gotoHydrated } from '../../../../../tests/e2e/gotoHydrated';
import { activate } from '../../../../../tests/e2e/keyboard';

const EXAMPLE = EXAMPLES[0];
const PANEL = EXAMPLE.panels[0];
const CHARACTER = EXAMPLE.characters[0];

test(
	'lists the panels a character appears in and previews a crop',
	{ tag: '@REQ-014' },
	async ({ page }) => {
		// Give the panel a freshly generated image (stored in OPFS) with character positions.
		await gotoHydrated(page, `/comic/${EXAMPLE.id}/${PANEL.id}`);
		await activate(page, page.getByRole('button', { name: m.removeImage() }));
		await activate(page, page.getByRole('button', { name: m.addImage() }));
		await expect(page.getByRole('img', { name: 'mock alt text' })).toBeVisible();

		await gotoHydrated(page, `/comic/${EXAMPLE.id}`);
		const panelsOfCharacter = page
			.getByRole('heading', { name: CHARACTER.name })
			.locator('xpath=following-sibling::ul[1]');
		const entry = panelsOfCharacter.getByRole('listitem').filter({ hasText: PANEL.editorialTitle });
		await expect(entry).toContainText('Is generated: true');

		await activate(page, entry.getByRole('button', { name: 'create' }));

		await expect(entry.locator('img[src^="blob:"]')).toBeVisible();
	},
);

test('previews a crop on an untouched example panel', { tag: '@REQ-014' }, async ({ page }) => {
	// Example images ship in static/, not OPFS; the preview must still read them.
	await gotoHydrated(page, `/comic/${EXAMPLE.id}`);
	const entry = page
		.getByRole('heading', { name: CHARACTER.name })
		.locator('xpath=following-sibling::ul[1]')
		.getByRole('listitem')
		.filter({ hasText: PANEL.editorialTitle });

	await activate(page, entry.getByRole('button', { name: 'create' }));

	await expect(entry.locator('img[src^="blob:"]')).toBeVisible();
});
