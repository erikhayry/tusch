import { m } from '#lib/paraglide/messages.js';
import { localizeHref } from '#lib/paraglide/runtime.js';
import { expect, test, type Locator } from '@playwright/test';
import { gotoHydrated } from '../../../../../tests/e2e/gotoHydrated';
import { storedComics } from '../../../../../tests/e2e/storage';
import { CreatePage } from './utils/createPage';

const colorOf = (locator: Locator) => locator.evaluate((el) => getComputedStyle(el).color);

/** Resolve a design token to the colour the browser computes for it. */
const tokenColor = (locator: Locator, token: string) =>
	locator.page().evaluate((name) => {
		const probe = document.createElement('span');
		probe.style.color = `var(${name})`;
		document.body.append(probe);
		const color = getComputedStyle(probe).color;
		probe.remove();
		return color;
	}, token);

test.describe('story counter', { tag: '@REQ-307-1' }, () => {
	test('starts at 0 and follows what is pasted', async ({ page }) => {
		const createPage = await new CreatePage(page).goto();

		await expect(createPage.storyCount).toHaveText('0 of 10,000');
		await createPage.pasteStory('hello');

		await expect(createPage.storyCount).toHaveText('5 of 10,000');
	});

	test('follows what is typed key by key', async ({ page }) => {
		const createPage = await new CreatePage(page).goto();
		await createPage.pasteStory('');
		await page.keyboard.type('hello');

		await expect(createPage.storyCount).toHaveText('5 of 10,000');
	});

	test('is described after the helper text and sits outside the label', async ({ page }) => {
		const createPage = await new CreatePage(page).goto();

		await expect(createPage.storyInput).toHaveAccessibleDescription(
			`${m.createComicStoryHint()} 0 of 10,000`,
		);
		await expect(createPage.storyInput).toHaveAccessibleName(`${m.yourStory()} ${m.optional()}`);
		// To the right of the label text on the same row.
		const label = await page.getByText(m.yourStory(), { exact: false }).first().boundingBox();
		const count = await createPage.storyCount.boundingBox();
		expect(label && count && count.x > label.x + label.width).toBe(true);
	});

	test('is not a live region', async ({ page }) => {
		const createPage = await new CreatePage(page).goto();

		const live = await createPage.storyCount.evaluate(
			(el) => el.closest('[aria-live], [role="status"], [role="alert"], output') !== null,
		);
		expect(live).toBe(false);
	});

	test('reads "0 av 10 000" in sv-se', async ({ page }) => {
		await gotoHydrated(page, localizeHref('/comic/create', { locale: 'sv-se' }));

		await expect(page.getByText(/^0 av 10[\s\u00a0\u202f]000$/)).toBeVisible();
	});

	test('is muted at 10,000 and danger at 10,001, which is still rejected', async ({ page }) => {
		const createPage = await new CreatePage(page).goto();
		const before = (await storedComics(page)).length;

		await createPage.pasteStory('x'.repeat(10_000));
		await expect(createPage.storyCount).toHaveText('10,000 of 10,000');
		const muted = await tokenColor(createPage.storyCount, '--color-muted');
		const danger = await tokenColor(createPage.storyCount, '--color-danger');
		expect(muted).not.toBe(danger);
		await expect.poll(() => colorOf(createPage.storyCount)).toBe(muted);

		await createPage.pasteStory('x'.repeat(10_001));
		await expect(createPage.storyCount).toHaveText('10,001 of 10,000');
		await expect.poll(() => colorOf(createPage.storyCount)).toBe(danger);

		await createPage.submit();
		await expect(createPage.error).toBeVisible();
		await expect(page).toHaveURL(/\/comic\/create$/);
		expect((await storedComics(page)).length).toBe(before);
	});
});
