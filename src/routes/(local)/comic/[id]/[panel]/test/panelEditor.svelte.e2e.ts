import { m } from '#lib/paraglide/messages.js';
import { expect, test, type Page } from '@playwright/test';
import { createComic, storedComic } from '../../../../../../tests/e2e/createdComic';
import { gotoHydrated } from '../../../../../../tests/e2e/gotoHydrated';
import { activate } from '../../../../../../tests/e2e/keyboard';
import { PanelCardsPage } from './utils/panelCardsPage';
import { UntitledPanelPage } from './utils/untitledPanelPage';

/** A user-made comic, opened on its panel at `index`; returns its ids, titles and panel list. */
async function openCreatedComic(page: Page, index = 1) {
	const cards = new PanelCardsPage(page, await createComic(page));
	await cards.open(index);
	const { panels } = await storedComic(page, cards.comicId);
	return { cards, panels, titles: await cards.cardTitles() };
}

const panelUrl = (comicId: string, panelId: string) => `/comic/${comicId}/${panelId}`;

test(
	'at 1280 px the panel list is one row above the panel, with no sidebar, and its links are named "Panel N <title>"',
	{ tag: ['@REQ-238-1', '@REQ-238-2'] },
	async ({ page }) => {
		await page.setViewportSize({ width: 1280, height: 920 });
		const { cards, panels, titles } = await openCreatedComic(page);
		expect(panels.length).toBeGreaterThanOrEqual(3);

		for (const [index, title] of titles.entries()) {
			const name = panels[index].editorialTitle
				? `${m.panel({ number: index + 1 })} ${title}`
				: m.panel({ number: index + 1 });
			await expect(cards.link(index)).toHaveAccessibleName(name);
		}

		expect(await cards.rowSpread()).toBeLessThanOrEqual(1);
		await expect(cards.list.locator('a[aria-current]')).toHaveCount(1);
		await expect(cards.link(1)).toHaveAttribute('aria-current', 'page');

		// Above the panel, not beside it: the list ends before the panel's heading starts.
		const listBox = await cards.list.boundingBox();
		const headingBox = await page
			.getByRole('heading', { name: titles[1], exact: true })
			.boundingBox();
		expect((listBox?.y ?? Infinity) + (listBox?.height ?? 0)).toBeLessThanOrEqual(
			headingBox?.y ?? -1,
		);
	},
);

test(
	'at 320 px the panel list is one horizontal row above the panel and the page does not scroll sideways',
	{ tag: ['@REQ-238-2', '@REQ-040'] },
	async ({ page }) => {
		await page.setViewportSize({ width: 320, height: 640 });
		const { cards, titles } = await openCreatedComic(page);

		expect(await cards.rowSpread()).toBeLessThanOrEqual(1);
		const listBox = await cards.list.boundingBox();
		const headingBox = await page
			.getByRole('heading', { name: titles[1], exact: true })
			.boundingBox();
		expect((listBox?.y ?? Infinity) + (listBox?.height ?? 0)).toBeLessThanOrEqual(
			headingBox?.y ?? -1,
		);

		const doc = await page.evaluate(() => ({
			scrollWidth: document.documentElement.scrollWidth,
			clientWidth: document.documentElement.clientWidth,
		}));
		expect(doc.scrollWidth).toBeLessThanOrEqual(doc.clientWidth);
	},
);

test(
	'panel 2 of 3 shows its position above a heading with the title',
	{ tag: '@REQ-298-1' },
	async ({ page }) => {
		const { panels, titles } = await openCreatedComic(page);
		const total = panels.length;
		const position = page.getByText(m.panelOfTotal({ number: 2, total }), { exact: true });
		const heading = page.getByRole('heading', { name: titles[1], exact: true });

		await expect(position).toBeVisible();
		await expect(heading).toBeVisible();
		const positionBox = await position.boundingBox();
		const headingBox = await heading.boundingBox();
		expect(positionBox?.y).toBeLessThan(headingBox?.y ?? -1);
	},
);

test(
	'a panel with an empty title has the heading "Panel <number>"',
	{ tag: '@REQ-298-1' },
	async ({ page }) => {
		const comicId = await createComic(page);
		const untitled = new UntitledPanelPage(page, comicId);
		await untitled.open();
		await untitled.addUntitledPanelBeforeFirst();
		const [first] = (await storedComic(page, comicId)).panels;
		await gotoHydrated(page, panelUrl(comicId, first.id));

		const total = await untitled.storedPanelCount();
		await expect(
			page.getByText(m.panelOfTotal({ number: 1, total }), { exact: true }),
		).toBeVisible();
		// The page's own <h1> also reads "Panel 1"; the panel's heading is the later one.
		await expect(
			page.getByRole('heading', { name: m.panel({ number: 1 }), exact: true }).last(),
		).toBeVisible();
	},
);

test(
	'Next opens the next panel and Prev opens the previous one',
	{ tag: '@REQ-298-2' },
	async ({ page }) => {
		const { cards, panels } = await openCreatedComic(page);
		const url = (index: number) => panelUrl(cards.comicId, panels[index].id);

		await activate(page, page.getByRole('link', { name: m.nextPanel(), exact: true }));
		await expect(page).toHaveURL(url(2));
		await expect(
			page.getByText(m.panelOfTotal({ number: 3, total: panels.length }), { exact: true }),
		).toBeVisible();

		await activate(page, page.getByRole('link', { name: m.previousPanel(), exact: true }));
		await expect(page).toHaveURL(url(1));
		await activate(page, page.getByRole('link', { name: m.previousPanel(), exact: true }));
		await expect(page).toHaveURL(url(0));
	},
);

/** The control that stands in for an unavailable Prev/Next: not a link, `aria-disabled`, named by its text or `aria-label`. */
function disabledPager(page: Page, name: string) {
	return page
		.locator(`[aria-disabled="true"][aria-label="${name}"]`)
		.or(page.locator('[aria-disabled="true"]').filter({ hasText: name }))
		.filter({ visible: true });
}

for (const { edge, index, shown, other } of [
	{ edge: 'first', index: 0, shown: m.previousPanel(), other: m.nextPanel() },
	{ edge: 'last', index: -1, shown: m.nextPanel(), other: m.previousPanel() },
]) {
	test(
		`on the ${edge} panel the ${shown} control is shown but is not a link`,
		{ tag: '@REQ-298-2' },
		async ({ page }) => {
			await openCreatedComic(page, index);

			await expect(page.getByRole('link', { name: shown, exact: true })).toHaveCount(0);
			const disabled = disabledPager(page, shown);
			await expect(disabled).toBeVisible();
			await expect(disabled).toHaveAttribute('aria-disabled', 'true');
			await expect(page.getByRole('link', { name: other, exact: true })).toBeVisible();
		},
	);
}

test('Read comic opens the viewer', { tag: '@REQ-298-3' }, async ({ page }) => {
	const { cards } = await openCreatedComic(page);

	await activate(page, page.getByRole('link', { name: m.readThisComic(), exact: true }));

	await expect(page).toHaveURL(`/comic/${cards.comicId}/view`);
});
