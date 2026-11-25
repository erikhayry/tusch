import { m } from '#lib/paraglide/messages.js';
import { expect, test, type Page } from '@playwright/test';
import { createComic, storedComic } from './createdComic';
import { gotoHydrated } from './gotoHydrated';
import { activate } from './keyboard';
import { VIEWS } from './views';

const EMPTY_TITLE_URL = 'https://example.com/article/mock-error:empty-title';
const MISSING_ID = '00000000-0000-4000-8000-000000000000';

const breadcrumb = (page: Page) => page.getByRole('navigation', { name: m.breadcrumb() });

/** A created comic and its second panel's page, as a user reaches it. */
async function openSecondPanel(page: Page, url?: string) {
	const comicId = await createComic(page, url);
	const comic = await storedComic(page, comicId);
	await gotoHydrated(page, `/comic/${comicId}/${comic.panels[1].id}`);
	return { comicId, title: comic.title };
}

test.describe('breadcrumb', () => {
	test(
		'the overview lists Comics and the title as the current page',
		{ tag: ['@REQ-311-1', '@REQ-035'] },
		async ({ page }) => {
			const comicId = await createComic(page);
			const { title } = await storedComic(page, comicId);
			const nav = breadcrumb(page);

			await expect(nav).toBeVisible();
			await expect(nav.getByRole('listitem')).toHaveCount(2);
			await expect(nav.getByRole('link', { name: m.comics() })).toHaveAttribute('href', '/');
			const current = nav.getByRole('listitem').last();
			await expect(current).toHaveText(title);
			await expect(current).toHaveAttribute('aria-current', 'page');
			await expect(current.getByRole('link')).toHaveCount(0);
			await expect(nav.getByRole('link')).toHaveCount(1);
			await expect(nav.locator('[aria-hidden="true"]').first()).toHaveText('/');
		},
	);

	test(
		'the panel page lists Comics, the title link and Panel 2 as the current page',
		{ tag: ['@REQ-311-1', '@REQ-035'] },
		async ({ page }) => {
			const { comicId, title } = await openSecondPanel(page);
			const nav = breadcrumb(page);

			await expect(nav.getByRole('listitem')).toHaveCount(3);
			await expect(nav.getByRole('link', { name: m.comics() })).toHaveAttribute('href', '/');
			await expect(nav.getByRole('link', { name: title, exact: true })).toHaveAttribute(
				'href',
				`/comic/${comicId}`,
			);
			const current = nav.getByRole('listitem').last();
			await expect(current).toHaveText(m.panel({ number: 2 }));
			await expect(current).toHaveAttribute('aria-current', 'page');
			await expect(nav.getByRole('link', { name: m.panel({ number: 2 }) })).toHaveCount(0);
		},
	);

	test(
		'the title link opens the comic overview from the keyboard',
		{ tag: '@REQ-311-1' },
		async ({ page }) => {
			const { comicId, title } = await openSecondPanel(page);

			await activate(page, breadcrumb(page).getByRole('link', { name: title, exact: true }));
			await expect(page).toHaveURL((url) => url.pathname === `/comic/${comicId}`);
		},
	);

	test.describe('at 320 px', () => {
		test.use({ viewport: { width: 320, height: 640 } });

		test(
			'the breadcrumb sits under the wordmark row without horizontal scroll',
			{ tag: ['@REQ-311-1', '@REQ-040'] },
			async ({ page }) => {
				await openSecondPanel(page);
				const nav = breadcrumb(page);
				await expect(nav).toBeVisible();

				const wordmark = await page
					.getByRole('banner')
					.getByRole('link', { name: m.tusch() })
					.boundingBox();
				const crumbs = await nav.boundingBox();
				expect(crumbs!.y).toBeGreaterThanOrEqual(wordmark!.y + wordmark!.height);
				const { scrollWidth, clientWidth } = await page.evaluate(() => ({
					scrollWidth: document.documentElement.scrollWidth,
					clientWidth: document.documentElement.clientWidth,
				}));
				expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
			},
		);
	});

	test(
		'a very long title takes one line and keeps its full accessible name',
		{ tag: ['@REQ-311-2', '@REQ-040'] },
		async ({ page }) => {
			const comicId = await createComic(page);
			const longTitle = `A very long comic title ${'that keeps going '.repeat(12)}`.trim();
			// The mock returns a short title, so store a long one as a real comic could have.
			await page.evaluate(
				([id, title]) => {
					const db = JSON.parse(localStorage.getItem('comics_db') ?? '{}');
					db.comics.find((comic: { id: string }) => comic.id === id).title = title;
					localStorage.setItem('comics_db', JSON.stringify(db));
				},
				[comicId, longTitle],
			);
			const comic = await storedComic(page, comicId);
			await gotoHydrated(page, `/comic/${comicId}/${comic.panels[1].id}`);

			const nav = breadcrumb(page);
			await expect(nav.getByRole('link', { name: longTitle, exact: true })).toBeVisible();
			const lineHeight = await nav.evaluate((el) => parseFloat(getComputedStyle(el).lineHeight));
			const height = (await nav.boundingBox())!.height;
			expect(height).toBeLessThan(lineHeight * 2);
			const { scrollWidth, clientWidth } = await page.evaluate(() => ({
				scrollWidth: document.documentElement.scrollWidth,
				clientWidth: document.documentElement.clientWidth,
			}));
			expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
		},
	);

	test(
		'an empty title shows "Untitled comic"',
		{ tag: ['@REQ-311-2', '@REQ-035'] },
		async ({ page }) => {
			const comicId = await createComic(page, EMPTY_TITLE_URL);
			expect((await storedComic(page, comicId)).title).toBe('');

			await expect(breadcrumb(page).getByRole('listitem').last()).toHaveText(m.untitledComic());
		},
	);

	test.describe('other views', { tag: '@REQ-311-3' }, () => {
		for (const [name, url] of [
			['landing', VIEWS.landing],
			['create', VIEWS.create],
			['settings', VIEWS.settings],
			['viewer', VIEWS.view],
			['not found', `/comic/${MISSING_ID}`],
		] as const) {
			test(`${name} has no breadcrumb`, async ({ page }) => {
				await gotoHydrated(page, url);

				await expect(page.getByRole('banner').first()).toBeVisible();
				await expect(breadcrumb(page)).toHaveCount(0);
			});
		}
	});

	test('the panel page has no "Back to Comic" link', { tag: '@REQ-311-4' }, async ({ page }) => {
		await openSecondPanel(page);

		await expect(page.getByRole('link', { name: m.backToComic() })).toHaveCount(0);
	});
});
