import { expect, test } from '@playwright/test';
import { createComic, deletePanel, storedComic } from '../../../tests/e2e/createdComic';
import { EXAMPLES } from '../../../examples/examples';
import { activate } from '../../../tests/e2e/keyboard';
import { metaLine } from '../../../tests/e2e/landingCopy';
import { LandingPage } from './utils/landingPage';

test.describe('home view card details', () => {
	test(
		'shows "Example" only on bundled examples, with style and panel count',
		{ tag: '@REQ-295-1' },
		async ({ page }) => {
			const id = await createComic(page);
			const created = await storedComic(page, id);
			const landingPage = await new LandingPage(page).goto();

			for (const example of EXAMPLES) {
				await expect(
					landingPage.card(example.title).getByText(metaLine(example, true), { exact: true }),
				).toBeVisible();
			}
			const meta = landingPage.card(created.title).getByText(metaLine(created, false), {
				exact: true,
			});
			await expect(meta).toBeVisible();
			await expect(meta).not.toContainText('Example');
		},
	);

	test('uses the singular for a comic with one panel', { tag: '@REQ-295-1' }, async ({ page }) => {
		const id = await createComic(page);
		let panels = (await storedComic(page, id)).panels.length;
		while (panels > 1) {
			await deletePanel(page, id, panels);
			panels--;
		}
		const created = await storedComic(page, id);
		expect(created.panels).toHaveLength(1);
		const landingPage = await new LandingPage(page).goto();

		await expect(
			landingPage.card(created.title).getByText(metaLine(created, false), { exact: true }),
		).toBeVisible();
		await expect(landingPage.card(created.title)).toContainText('1 panel');
		await expect(landingPage.card(created.title)).not.toContainText('1 panels');
	});
});

test.describe('home view heading', () => {
	test(
		'reads "Your comics" with the number of comics, which drops on delete',
		{ tag: ['@REQ-295-2', '@REQ-002'] },
		async ({ page }) => {
			await createComic(page);
			const landingPage = await new LandingPage(page).goto();
			const total = EXAMPLES.length + 1;
			const count = (n: number) =>
				landingPage.comicsHeading.locator('xpath=..').getByText(String(n), { exact: true });

			await expect(landingPage.comicsHeading).toBeVisible();
			await expect(count(total)).toBeVisible();

			await activate(page, landingPage.deleteComicButton(EXAMPLES[0]?.title ?? ''));

			await expect(count(total - 1)).toBeVisible();
			await expect(count(total)).toBeHidden();
		},
	);
});

test.describe('home view create tile', () => {
	test(
		'is the last grid cell, opens the create view by keyboard and is the only create link in the body',
		{ tag: '@REQ-295-3' },
		async ({ page }) => {
			const landingPage = await new LandingPage(page).goto();

			await expect(landingPage.createTile).toHaveCount(1);
			await expect(landingPage.createTile).toHaveAttribute('href', '/comic/create');
			await expect(
				landingPage.cards.last().getByRole('link', { name: /create new comic/i }),
			).toBeVisible();
			await expect(landingPage.cards).toHaveCount(EXAMPLES.length + 1);
			await expect(
				page.getByRole('main').getByRole('link', { name: /create new comic/i }),
			).toHaveCount(1);
			await expect(page.getByRole('main').getByRole('link', { name: 'Settings' })).toHaveCount(0);

			await activate(page, landingPage.createTile);

			await expect(page).toHaveURL(/\/comic\/create$/);
		},
	);
});
