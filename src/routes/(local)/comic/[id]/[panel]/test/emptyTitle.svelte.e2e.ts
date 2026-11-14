import AxeBuilder from '@axe-core/playwright';
import { m } from '$lib/paraglide/messages';
import { expect, test } from '@playwright/test';
import { createComic, storedComic } from '../../../../../../tests/e2e/createdComic';
import { gotoHydrated } from '../../../../../../tests/e2e/gotoHydrated';
import { activate } from '../../../../../../tests/e2e/keyboard';

test(
	'panel navigation link has an accessible name when the panel title is empty',
	{ tag: ['@REQ-190-1', '@REQ-035'] },
	async ({ page }) => {
		const comicId = await createComic(page);
		const [firstPanel] = (await storedComic(page, comicId)).panels;
		await gotoHydrated(page, `/comic/${comicId}/${firstPanel.id}`);

		// The mock's "add panel" response has an empty editorialTitle, as a real comic can.
		await activate(page, page.getByRole('button', { name: m.addPanelBefore({ number: 1 }) }));
		await expect(page.getByRole('progressbar')).toBeHidden();
		await expect
			.poll(async () => (await storedComic(page, comicId)).panels.map((p) => p.editorialTitle))
			.toContain('');

		const panels = page.getByRole('list', { name: m.panels() }).getByRole('listitem');
		await expect(panels).toHaveCount((await storedComic(page, comicId)).panels.length);

		// The new, untitled panel is first; its link falls back to the panel number.
		await expect(panels.nth(0).getByRole('link', { name: m.panel({ number: 1 }) })).toBeVisible();

		const { violations } = await new AxeBuilder({ page }).analyze();
		expect(
			violations.map(({ id, nodes }) => ({ id, nodes: nodes.map((n) => n.target.join(' ')) })),
		).toEqual([]);
	},
);
