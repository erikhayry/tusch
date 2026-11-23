import { expect, test, type Locator, type Page } from '@playwright/test';
import { m } from '#lib/paraglide/messages.js';
import { localizeHref } from '#lib/paraglide/runtime.js';
import { EXAMPLE_COMPLETE as EXAMPLE } from './examples';
import { gotoHydrated } from './gotoHydrated';
import { activate, tabTo } from './keyboard';
import { VIEWS } from './views';

const WIDE = { width: 1024, height: 768 };
const NARROW = { width: 320, height: 640 };

const banner = (page: Page) => page.getByRole('banner');
const bannerLink = (page: Page, name: string) => banner(page).getByRole('link', { name });
const mainNav = (page: Page, locale?: 'sv-se') =>
	page.getByRole('navigation', { name: m.mainNavigation({}, { locale }) });
const languageNav = (page: Page, locale?: 'sv-se') =>
	page.getByRole('navigation', { name: m.languageNavigation({}, { locale }) });

async function expectCurrent(link: Locator, current: boolean) {
	if (current) {
		await expect(link).toHaveAttribute('aria-current', 'page');
	} else {
		await expect(link).not.toHaveAttribute('aria-current');
	}
}

test.describe('every view has a header with the wordmark', { tag: '@REQ-294-1' }, () => {
	for (const [name, url] of Object.entries(VIEWS)) {
		test(name, async ({ page }) => {
			await gotoHydrated(page, url);

			await expect(banner(page)).toHaveCount(1);
			await expect(page.locator('main').getByRole('banner')).toHaveCount(0);
			const wordmark = bannerLink(page, m.tusch());
			await expect(wordmark).toHaveAttribute('href', '/');

			await activate(page, wordmark);
			await expect(page).toHaveURL((u) => u.pathname === '/');
		});
	}
});

test.describe('wide screens: main navigation', { tag: '@REQ-294-2' }, () => {
	test.use({ viewport: WIDE });

	for (const [view, url, current] of [
		['landing', VIEWS.landing, 'comics'],
		['settings', VIEWS.settings, 'settings'],
	] as const) {
		test(`marks the current page on ${view}`, async ({ page }) => {
			await gotoHydrated(page, url);
			const nav = mainNav(page);
			const comics = nav.getByRole('link', { name: m.comics() });
			const settings = nav.getByRole('link', { name: m.settings() });

			await expect(comics).toHaveAttribute('href', '/');
			await expect(settings).toHaveAttribute('href', '/settings');
			await expectCurrent(comics, current === 'comics');
			await expectCurrent(settings, current === 'settings');
		});
	}

	test('Create New Comic opens the create view from the landing page', async ({ page }) => {
		await gotoHydrated(page, VIEWS.landing);

		await activate(page, bannerLink(page, m.createNewComic()));

		await expect(page).toHaveURL((u) => u.pathname === VIEWS.create);
	});
});

test.describe('wide screens: language links', { tag: '@REQ-294-3' }, () => {
	test.use({ viewport: WIDE });

	test('switch the page between English and Swedish', async ({ page }) => {
		await gotoHydrated(page, VIEWS.settings);
		const english = languageNav(page).getByRole('link', { name: m.languageEnglish() });
		const swedish = languageNav(page).getByRole('link', { name: m.languageSwedish() });
		await expect(english).toHaveAttribute('aria-current', 'true');
		await expect(swedish).not.toHaveAttribute('aria-current');

		await activate(page, swedish);

		await expect(page).toHaveURL(
			(u) => u.pathname === localizeHref(VIEWS.settings, { locale: 'sv-se' }),
		);
		await expect(mainNav(page, 'sv-se')).toBeVisible();
		await expect(
			languageNav(page, 'sv-se').getByRole('link', {
				name: m.languageSwedish({}, { locale: 'sv-se' }),
			}),
		).toHaveAttribute('aria-current', 'true');

		await activate(
			page,
			languageNav(page, 'sv-se').getByRole('link', {
				name: m.languageEnglish({}, { locale: 'sv-se' }),
			}),
		);

		await expect(page).toHaveURL((u) => u.pathname === VIEWS.settings);
		await expect(mainNav(page)).toBeVisible();
		await expect(english).toHaveAttribute('aria-current', 'true');
	});
});

test.describe('narrow screens: icon links', { tag: '@REQ-294-4' }, () => {
	test.use({ viewport: NARROW });

	test('show only the wordmark and two icon links', async ({ page }) => {
		await gotoHydrated(page, VIEWS.comic);

		await expect(bannerLink(page, m.tusch())).toBeVisible();
		await expect(mainNav(page)).toBeHidden();
		await expect(languageNav(page)).toBeHidden();
		for (const name of [m.createNewComic(), m.settings()]) {
			const link = bannerLink(page, name);
			await expect(link).toBeVisible();
			await expect(link).toHaveAttribute('aria-label', name);
			await expect(link.locator('[aria-hidden="true"]')).not.toHaveCount(0);
		}
	});

	for (const [name, target] of [
		[m.createNewComic(), VIEWS.create],
		[m.settings(), VIEWS.settings],
	] as const) {
		test(`${name} is reachable by Tab and leads to its page`, async ({ page }) => {
			await gotoHydrated(page, `/comic/${EXAMPLE.id}`);
			const link = bannerLink(page, name);

			await tabTo(page, link, 10);
			await page.keyboard.press('Enter');

			await expect(page).toHaveURL((u) => u.pathname === target);
		});
	}
});

test(
	'fonts load from the app origin and nothing else is requested elsewhere',
	{ tag: '@REQ-294-5' },
	async ({ page }) => {
		const requests: { url: string; type: string }[] = [];
		page.on('request', (request) =>
			requests.push({ url: request.url(), type: request.resourceType() }),
		);

		for (const url of Object.values(VIEWS)) {
			await gotoHydrated(page, url);
			await page.waitForLoadState('networkidle');
		}

		const origin = new URL(page.url()).origin;
		const external = requests.filter(
			({ url }) => !/^(data|blob|about):/.test(url) && new URL(url).origin !== origin,
		);
		expect(external).toEqual([]);
		// The self-hosted Inter faces must actually be fetched, or the test proves nothing.
		expect(requests.filter(({ type }) => type === 'font').length).toBeGreaterThan(0);
	},
);

test.describe('form fields at 320 px', { tag: '@REQ-294-6' }, () => {
	test.use({ viewport: NARROW });

	for (const url of [VIEWS.create, VIEWS.settings]) {
		test(`${url} uses at least 16px`, async ({ page }) => {
			await gotoHydrated(page, url);

			const sizes = await page.evaluate(() =>
				[
					...document.querySelectorAll<HTMLElement>(
						'input:not([type=hidden]):not([type=checkbox]):not([type=radio]):not([type=file]):not([type=submit]), textarea, select',
					),
				].map((el) => ({
					field: el.outerHTML.slice(0, 60),
					size: parseFloat(getComputedStyle(el).fontSize),
				})),
			);
			expect(sizes.length).toBeGreaterThan(0);
			expect(sizes.filter(({ size }) => size < 16)).toEqual([]);
		});
	}
});
