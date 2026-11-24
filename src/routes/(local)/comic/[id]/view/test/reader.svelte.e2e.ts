import { m } from '#lib/paraglide/messages.js';
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { luminance } from '../../../../../../tests/e2e/contrast';
import { deletePanel, storedComic } from '../../../../../../tests/e2e/createdComic';
import { activate, tabTo } from '../../../../../../tests/e2e/keyboard';
import { pageColours } from './utils/pageColours';
import { ViewPage } from './utils/viewPage';
import { createViewableComic } from './utils/viewableComic';

const WIDE = { width: 1280, height: 720 };
const NARROW = { width: 390, height: 844 };

const countText = (count: number) => (count === 1 ? m.panelCountOne() : m.panelCount({ count }));

async function expectNoAxeViolations(page: Page) {
	await page.waitForLoadState('networkidle');
	const { violations } = await new AxeBuilder({ page }).analyze();
	expect(
		violations.map(({ id, nodes }) => ({ id, nodes: nodes.map((node) => node.target.join(' ')) })),
	).toEqual([]);
}

test.describe('the reader is always dark', { tag: ['@REQ-044', '@REQ-035'] }, () => {
	test('has the same dark colours in the light and the dark scheme, and passes axe in both', async ({
		page,
	}) => {
		const comic = await createViewableComic(page);
		const view = new ViewPage(page, comic.id);
		const seen = [];
		for (const scheme of ['light', 'dark'] as const) {
			await page.emulateMedia({ colorScheme: scheme });
			await view.goto();
			const colours = await pageColours(page);
			expect(luminance(colours.background)).toBeLessThan(0.1);
			expect(luminance(colours.text)).toBeGreaterThan(0.5);
			expect(colours.colorScheme).toContain('dark');
			await expectNoAxeViolations(page);
			seen.push({ background: colours.background, text: colours.text });
		}
		expect(seen[0]).toEqual(seen[1]);
	});
});

test.describe('the reader header', { tag: '@REQ-299-1' }, () => {
	test.use({ viewport: WIDE });

	test('is the only banner, with Back to editing, the title as plain text and Download comic', async ({
		page,
	}) => {
		const comic = await createViewableComic(page);
		const view = await new ViewPage(page, comic.id).goto();

		await expect(view.header).toHaveCount(1);
		await expect(page.getByRole('main').getByRole('banner')).toHaveCount(0);
		await expect(view.headerBackLink).toHaveAttribute('href', `/comic/${comic.id}`);
		const download = view.header.getByRole('link', { name: m.downloadComic(), exact: true });
		await expect(download).toHaveAttribute('download');

		// No wordmark, no navigation of any kind.
		await expect(page.getByRole('link', { name: m.tusch(), exact: true })).toHaveCount(0);
		await expect(page.getByRole('navigation')).toHaveCount(0);

		// The title is plain text on one line with an ellipsis, and the page's only heading is the <h1>.
		await expect(view.header.getByRole('heading')).toHaveCount(0);
		await expect(view.title).toHaveCount(1);
		const title = view.header.getByText(comic.title, { exact: true });
		await expect(title).toBeVisible();
		const style = await title.evaluate((element) => {
			const { whiteSpace, textOverflow, overflow } = getComputedStyle(element);
			return { whiteSpace, textOverflow, overflow };
		});
		expect(style).toEqual({ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' });
	});

	test('Back to editing in the header opens the comic page', async ({ page }) => {
		const comic = await createViewableComic(page);
		const view = await new ViewPage(page, comic.id).goto();

		await activate(page, view.headerBackLink);

		await expect(page).toHaveURL(`/comic/${comic.id}`);
	});

	test('stays visible at the top at the last panel of a long comic', async ({ page }) => {
		const comic = await createViewableComic(page);
		const view = await new ViewPage(page, comic.id).goto();

		await view.panelSection(comic.panels.length).scrollIntoViewIfNeeded();
		await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);

		await expect(view.header).toBeInViewport({ ratio: 1 });
		const box = await view.header.boundingBox();
		expect(box?.y ?? 1).toBeLessThanOrEqual(1);
	});

	test.describe('on a narrow screen', () => {
		test.use({ viewport: NARROW });

		test('has two 44 px icon links with the same names, reachable by Tab', async ({ page }) => {
			const comic = await createViewableComic(page);
			const view = await new ViewPage(page, comic.id).goto();

			const download = view.header.getByRole('link', { name: m.downloadComic(), exact: true });
			for (const link of [view.headerBackLink, download]) {
				await expect(link).toBeVisible();
				await expect(link).toHaveAttribute('aria-label');
				// The icon is decorative; the name comes from aria-label alone.
				await expect(link.locator('[aria-hidden="true"]')).not.toHaveCount(0);
				const box = await link.boundingBox();
				expect(box?.width).toBeGreaterThanOrEqual(44);
				expect(box?.height).toBeGreaterThanOrEqual(44);
				await tabTo(page, link);
			}
			await expect(view.headerBackLink).toHaveAttribute('aria-label', m.backToEditing());
			await expect(download).toHaveAttribute('aria-label', m.downloadComic());
		});
	});
});

test.describe('the ending block', { tag: ['@REQ-299-2'] }, () => {
	test.use({ viewport: WIDE });

	test('shows The end, the panel count and the three links', async ({ page }) => {
		const comic = await createViewableComic(page);
		const view = await new ViewPage(page, comic.id).goto();

		const end = view.main.getByText(m.theEnd());
		await end.scrollIntoViewIfNeeded();
		await expect(end).toBeVisible();
		await expect(
			view.main.getByText(countText(comic.panels.length), { exact: true }),
		).toBeVisible();
		// The "·" between them is decoration.
		await expect(view.main.locator('[aria-hidden="true"]', { hasText: '·' })).not.toHaveCount(0);

		await expect(view.endingBackLink).toHaveAttribute('href', `/comic/${comic.id}`);
		await expect(view.allComicsLink).toHaveAttribute('href', '/');
		await expect(
			view.main.getByRole('link', { name: m.downloadComic(), exact: true }),
		).toHaveAttribute('download');
		// It comes after the last panel.
		const last = await view.panelSection(comic.panels.length).boundingBox();
		const ending = await end.boundingBox();
		expect(ending?.y ?? 0).toBeGreaterThan((last?.y ?? 0) + 1);
	});

	test('says "1 panel" for a comic with one panel', async ({ page }) => {
		const comic = await createViewableComic(page);
		for (let number = comic.panels.length; number > 1; number--) {
			await deletePanel(page, comic.id, number);
		}
		expect((await storedComic(page, comic.id)).panels).toHaveLength(1);

		const view = await new ViewPage(page, comic.id).goto();

		await expect(view.main.getByText(m.theEnd())).toBeVisible();
		await expect(view.main.getByText(m.panelCountOne(), { exact: true })).toBeVisible();
	});

	test('All comics leads to the library', async ({ page }) => {
		const comic = await createViewableComic(page);
		const view = await new ViewPage(page, comic.id).goto();

		await activate(page, view.allComicsLink);

		await expect(page).toHaveURL((url) => url.pathname === '/');
	});

	test('Back to editing leads to the comic page', async ({ page }) => {
		const comic = await createViewableComic(page);
		const view = await new ViewPage(page, comic.id).goto();

		await activate(page, view.endingBackLink);

		await expect(page).toHaveURL(`/comic/${comic.id}`);
	});
});
