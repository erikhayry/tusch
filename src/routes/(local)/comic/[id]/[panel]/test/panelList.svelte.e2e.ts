import { m } from '$lib/paraglide/messages';
import { expect, test, type Page } from '@playwright/test';
import { createComic, deletePanel, storedComic } from '../../../../../../tests/e2e/createdComic';
import { gotoHydrated } from '../../../../../../tests/e2e/gotoHydrated';
import { activate } from '../../../../../../tests/e2e/keyboard';

/** The mock's "add panel" response has an empty editorialTitle, so its link reads "Panel <n>". */

function panelLinks(page: Page) {
	return page.getByRole('list', { name: m.panels() }).getByRole('listitem').getByRole('link');
}

function button(page: Page, kind: 'before' | 'after', number: number) {
	const name = kind === 'before' ? m.addPanelBefore({ number }) : m.addPanelAfter({ number });
	return page.getByRole('button', { name, exact: true });
}

/** A user-made comic, opened on its first panel; returns the ids and the list's link names. */
async function openCreatedComic(page: Page, keepPanels?: number) {
	const comicId = await createComic(page);
	if (keepPanels !== undefined) {
		const count = (await storedComic(page, comicId)).panels.length;
		for (let i = count; i > keepPanels; i--) {
			await deletePanel(page, comicId, 1);
		}
	}
	const [first] = (await storedComic(page, comicId)).panels;
	const url = `/comic/${comicId}/${first.id}`;
	await gotoHydrated(page, url);
	const titles = await panelLinks(page).allTextContents();
	return { comicId, url, titles: titles.map((title) => title.trim()) };
}

async function insert(page: Page, kind: 'before' | 'after', number: number) {
	await activate(page, button(page, kind, number));
	await expect(page.getByRole('progressbar')).toBeHidden();
}

test('offers each insertion point exactly once', { tag: '@REQ-021' }, async ({ page }) => {
	const { titles } = await openCreatedComic(page);
	expect(titles.length).toBeGreaterThanOrEqual(3);

	await expect(button(page, 'before', 1)).toHaveCount(1);
	for (let number = 1; number <= titles.length; number++) {
		await expect(button(page, 'after', number)).toHaveCount(1);
	}
	for (let number = 2; number <= titles.length; number++) {
		await expect(button(page, 'before', number)).toHaveCount(0);
	}
});

test(
	'a one-panel comic offers both insertion points on its only panel',
	{ tag: '@REQ-021' },
	async ({ page }) => {
		await openCreatedComic(page, 1);

		const items = page.getByRole('list', { name: m.panels() }).getByRole('listitem');
		await expect(items).toHaveCount(1);
		await expect(
			items.first().getByRole('button', { name: m.addPanelBefore({ number: 1 }) }),
		).toBeVisible();
		await expect(
			items.first().getByRole('button', { name: m.addPanelAfter({ number: 1 }) }),
		).toBeVisible();
	},
);

test(
	'add panel before panel 1 makes the new panel the first',
	{ tag: '@REQ-021' },
	async ({ page }) => {
		const { titles } = await openCreatedComic(page);

		await insert(page, 'before', 1);

		await expect(panelLinks(page)).toHaveText([m.panel({ number: 1 }), ...titles]);
	},
);

test(
	'add panel after panel 1 inserts the new panel second and keeps the order after a reload',
	{ tag: ['@REQ-237-1', '@REQ-022'] },
	async ({ page }) => {
		const { titles } = await openCreatedComic(page);
		expect(titles.length).toBeGreaterThanOrEqual(2);
		const expected = [titles[0], m.panel({ number: 2 }), ...titles.slice(1)];

		await insert(page, 'after', 1);
		await expect(panelLinks(page)).toHaveText(expected);

		await page.reload();
		await expect(panelLinks(page)).toHaveText(expected);
	},
);

test('add panel after the last panel appends it', { tag: '@REQ-237-1' }, async ({ page }) => {
	const { titles } = await openCreatedComic(page);

	await insert(page, 'after', titles.length);

	await expect(panelLinks(page)).toHaveText([...titles, m.panel({ number: titles.length + 1 })]);
});

test(
	'inserting a panel keeps the user on the same page and adds one to the list',
	{ tag: '@REQ-021' },
	async ({ page }) => {
		const { url, titles } = await openCreatedComic(page);

		await insert(page, 'after', 2);

		await expect(panelLinks(page)).toHaveCount(titles.length + 1);
		expect(new URL(page.url()).pathname).toBe(url);
	},
);
