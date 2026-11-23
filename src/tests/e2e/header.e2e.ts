import { expect, test, type Locator } from '@playwright/test';
import { m } from '#lib/paraglide/messages.js';
import { locales, localizeHref } from '#lib/paraglide/runtime.js';
import { EXAMPLE_COMPLETE as EXAMPLE } from './examples';
import { gotoHydrated } from './gotoHydrated';
import { activate, tabTo } from './keyboard';
import { VIEWS } from './views';
import { HeaderPage } from './utils/headerPage';

const WIDE = { width: 1024, height: 768 };
const NARROW = { width: 320, height: 640 };
const [ENGLISH, SWEDISH] = locales;

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
			const header = new HeaderPage(page);
			await gotoHydrated(page, url);

			await expect(header.banner).toHaveCount(1);
			await expect(page.locator('main').getByRole('banner')).toHaveCount(0);
			const wordmark = header.bannerLink(m.tusch());
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
			const header = new HeaderPage(page);
			await gotoHydrated(page, url);
			const nav = header.mainNav();
			const comics = nav.getByRole('link', { name: m.comics() });
			const settings = nav.getByRole('link', { name: m.settings() });

			await expect(comics).toHaveAttribute('href', '/');
			await expect(settings).toHaveAttribute('href', '/settings');
			await expectCurrent(comics, current === 'comics');
			await expectCurrent(settings, current === 'settings');
		});
	}

	test('Create New Comic opens the create view from the landing page', async ({ page }) => {
		const header = new HeaderPage(page);
		await gotoHydrated(page, VIEWS.landing);

		await activate(page, header.bannerLink(m.createNewComic()));

		await expect(page).toHaveURL((u) => u.pathname === VIEWS.create);
	});
});

test.describe('wide screens: language links', { tag: '@REQ-294-3' }, () => {
	test.use({ viewport: WIDE });

	test('switch the page between English and Swedish', async ({ page }) => {
		const header = new HeaderPage(page);
		await gotoHydrated(page, VIEWS.settings);
		const english = header.languageNav().getByRole('link', { name: m.languageEnglish() });
		const swedish = header.languageNav().getByRole('link', { name: m.languageSwedish() });
		await expect(english).toHaveAttribute('aria-current', 'true');
		await expect(swedish).not.toHaveAttribute('aria-current');

		await activate(page, swedish);

		await expect(page).toHaveURL(
			(u) => u.pathname === localizeHref(VIEWS.settings, { locale: SWEDISH }),
		);
		await expect(header.mainNav(SWEDISH)).toBeVisible();
		await expect(
			header.languageNav(SWEDISH).getByRole('link', {
				name: m.languageSwedish({}, { locale: SWEDISH }),
			}),
		).toHaveAttribute('aria-current', 'true');

		await activate(
			page,
			header.languageNav(SWEDISH).getByRole('link', {
				name: m.languageEnglish({}, { locale: SWEDISH }),
			}),
		);

		await expect(page).toHaveURL((u) => u.pathname === VIEWS.settings);
		await expect(header.mainNav(ENGLISH)).toBeVisible();
		await expect(english).toHaveAttribute('aria-current', 'true');
	});
});

test.describe('narrow screens: icon links', { tag: '@REQ-294-4' }, () => {
	test.use({ viewport: NARROW });

	test('show only the wordmark and two icon links', async ({ page }) => {
		const header = new HeaderPage(page);
		await gotoHydrated(page, VIEWS.comic);

		await expect(header.bannerLink(m.tusch())).toBeVisible();
		await expect(header.mainNav()).toBeHidden();
		await expect(header.languageNav()).toBeHidden();
		for (const name of [m.createNewComic(), m.settings()]) {
			const link = header.bannerLink(name);
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
			const header = new HeaderPage(page);
			await gotoHydrated(page, `/comic/${EXAMPLE.id}`);
			const link = header.bannerLink(name);

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
