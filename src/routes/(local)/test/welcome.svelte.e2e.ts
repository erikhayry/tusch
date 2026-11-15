import { expect, test, type BrowserContext } from '@playwright/test';
import { KEY_COOKIE_NAME } from '$lib/utils/cookies';
import { createComic } from '../../../tests/e2e/createdComic';
import { EXAMPLE_COMPLETE as EXAMPLE, exampleTitles } from '../../../tests/e2e/examples';
import { KEY_COPY } from '../../../tests/e2e/keyCopy';
import { activate } from '../../../tests/e2e/keyboard';
import { LandingPage } from './utils/landingPage';

const ORIGIN = 'http://localhost:4173';

const keyCookie = async (context: BrowserContext) =>
	(await context.cookies()).find(({ name }) => name === KEY_COOKIE_NAME);

const setKeyCookie = (context: BrowserContext, value: string) =>
	context.addCookies([{ name: KEY_COOKIE_NAME, value, url: ORIGIN }]);

test.describe('welcome section', () => {
	test(
		'greets a visitor without a key above the example list',
		{ tag: ['@REQ-234-1', '@REQ-001'] },
		async ({ page }) => {
			const landingPage = await new LandingPage(page).goto();

			await expect(landingPage.welcomeHeading).toBeVisible();
			await expect(landingPage.welcome.getByText(KEY_COPY.welcomeSentence)).toBeVisible();
			await expect(landingPage.keyInput).toBeVisible();
			await expect(landingPage.saveKeyButton).toBeVisible();

			for (const title of exampleTitles()) {
				await expect(landingPage.comicLink(title)).toBeVisible();
			}

			const welcomeBox = await landingPage.welcomeHeading.boundingBox();
			const comicsBox = await landingPage.comicsHeading.boundingBox();
			expect(welcomeBox?.y).toBeLessThan(comicsBox?.y ?? 0);
		},
	);

	test(
		'replaces the form with a confirmation and a create link once the key is accepted',
		{ tag: ['@REQ-234-3', '@REQ-028'] },
		async ({ page, context }) => {
			const landingPage = await new LandingPage(page).goto();

			await landingPage.saveKey();

			await expect(landingPage.welcome.getByText(KEY_COPY.keySaved)).toBeVisible();
			await expect(
				landingPage.welcome.getByRole('link', { name: KEY_COPY.createComic }),
			).toBeVisible();
			await expect(landingPage.keyInput).toBeHidden();
			const cookie = await keyCookie(context);
			expect(decodeURIComponent(cookie?.value ?? '')).toBe('mock key');
			expect(cookie?.httpOnly).toBe(true);
		},
	);

	test(
		'shows the invalid-key message, keeps the form and stores nothing for a rejected key',
		{ tag: ['@REQ-234-3', '@REQ-028'] },
		async ({ page, context }) => {
			const landingPage = await new LandingPage(page).goto();

			await landingPage.saveKey('an invalid key');

			await expect(landingPage.welcome.getByText(KEY_COPY.invalidKey)).toBeVisible();
			await expect(landingPage.keyInput).toBeVisible();
			expect(await keyCookie(context)).toBeUndefined();
		},
	);

	test('is hidden when a key is stored', { tag: '@REQ-234-2' }, async ({ page, context }) => {
		await setKeyCookie(context, 'mock key');

		const landingPage = await new LandingPage(page).goto();

		await expect(landingPage.comicsHeading).toBeVisible();
		await expect(landingPage.comicLink(EXAMPLE.title)).toBeVisible();
		await expect(landingPage.welcomeHeading).toHaveCount(0);
		await expect(landingPage.keyInput).toHaveCount(0);
	});

	test(
		'is hidden once the user has created a comic, even without a key',
		{ tag: '@REQ-234-2' },
		async ({ page, context }) => {
			// A real user needs a key to generate; the comic is made through the UI, then the key is gone.
			await setKeyCookie(context, 'mock key');
			await createComic(page);
			await context.clearCookies({ name: KEY_COOKIE_NAME });
			expect(await keyCookie(context)).toBeUndefined();

			const landingPage = await new LandingPage(page).goto();

			await expect(landingPage.comicsHeading).toBeVisible();
			await expect(landingPage.welcomeHeading).toHaveCount(0);
		},
	);

	test(
		'stays when only some of the examples are deleted',
		{ tag: '@REQ-234-1' },
		async ({ page }) => {
			const landingPage = await new LandingPage(page).goto();

			await activate(page, landingPage.deleteComicButton(EXAMPLE.title));
			await expect(landingPage.comicLink(EXAMPLE.title)).toBeHidden();
			await page.reload();

			await expect(landingPage.comicLink(EXAMPLE.title)).toBeHidden();
			await expect(landingPage.welcomeHeading).toBeVisible();
			await expect(landingPage.keyInput).toBeVisible();
		},
	);

	test(
		'never exposes the API key, shown or hidden',
		{ tag: ['@REQ-029', '@REQ-234-2'] },
		async ({ page, context }) => {
			const secret = 'sk-secret-welcome-value';
			const landingPage = await new LandingPage(page).goto();
			await expect(landingPage.welcomeHeading).toBeVisible();
			await landingPage.saveKey(secret);
			await expect(landingPage.welcome.getByText(KEY_COPY.keySaved)).toBeVisible();

			// Welcome hidden: the key is in the cookie now.
			await page.reload();
			await expect(landingPage.comicsHeading).toBeVisible();
			await expect(landingPage.welcomeHeading).toHaveCount(0);
			expect(await page.content()).not.toContain(secret);
			expect(await page.evaluate(() => document.cookie)).not.toContain(secret);

			// A cookie with a known value set directly, as on a returning visit.
			const otherSecret = 'sk-secret-cookie-value';
			await setKeyCookie(context, otherSecret);
			await page.reload();
			await expect(landingPage.comicsHeading).toBeVisible();
			expect(await page.content()).not.toContain(otherSecret);
			expect(await page.evaluate(() => document.cookie)).not.toContain(otherSecret);
		},
	);
});
