import { m } from '#lib/paraglide/messages.js';
import { expect, test } from '@playwright/test';
import { storedComics } from '../../../../../tests/e2e/storage';
import { tabTo } from '../../../../../tests/e2e/keyboard';
import { CreatePage } from './utils/createPage';

const STORY = 'A lighthouse keeper finds a message in a bottle.\nIt leads her to a hidden cove.';
const COMIC_URL = /\/comic\/[0-9a-f-]{36}$/;
const STYLES = () => [
	{ name: m.styleAnime(), description: m.styleAnimeDescription() },
	{ name: m.styleClassicMarvel(), description: m.styleClassicMarvelDescription() },
	{ name: m.styleFrancoBelgian(), description: m.styleFrancoBelgianDescription() },
];

test(
	'the comic style is a radio group of three cards with Anime checked',
	{ tag: '@REQ-306-1' },
	async ({ page }) => {
		const createPage = await new CreatePage(page).goto();
		const group = page.getByRole('group', { name: m.comicStyles() });

		await expect(group).toBeVisible();
		await expect(group.getByRole('radio')).toHaveCount(3);
		for (const [index, { name, description }] of STYLES().entries()) {
			await expect(group.getByRole('radio').nth(index)).toHaveAccessibleName(name);
			await expect(group.getByText(description)).toBeVisible();
			await expect(createPage.styleRadio(name)).toHaveAttribute('required', '');
		}
		await expect(createPage.styleRadio(m.styleAnime())).toBeChecked();
		await expect(page.getByRole('combobox', { name: m.comicStyles() })).toHaveCount(0);
	},
);

test(
	'arrow keys move the style choice and Tab leaves the group in one stop',
	{ tag: ['@REQ-306-1', '@REQ-037'] },
	async ({ page }) => {
		const createPage = await new CreatePage(page).goto();
		const anime = createPage.styleRadio(m.styleAnime());
		const marvel = createPage.styleRadio(m.styleClassicMarvel());
		const franco = createPage.styleRadio(m.styleFrancoBelgian());

		await tabTo(page, anime);
		await page.keyboard.press('ArrowRight');
		await expect(marvel).toBeChecked();
		await expect(marvel).toBeFocused();
		await page.keyboard.press('ArrowDown');
		await expect(franco).toBeChecked();
		await expect(franco).toBeFocused();

		// One tab stop: the next Tab skips the unchecked radios and lands on the footer.
		await page.keyboard.press('Tab');
		await expect(page.locator('form').getByRole('link', { name: m.settings() })).toBeFocused();
	},
);

test.describe('the style cards by viewport', { tag: '@REQ-306-2' }, () => {
	const cases = [
		{ width: 1280, height: 800, sameRow: true },
		{ width: 390, height: 844, sameRow: false },
	];
	for (const { width, height, sameRow } of cases) {
		test(`${sameRow ? 'sit side by side' : 'stack as full-width rows'} at ${width}px`, async ({
			page,
		}) => {
			await page.setViewportSize({ width, height });
			await new CreatePage(page).goto();
			const group = page.getByRole('group', { name: m.comicStyles() });
			const cards = group.locator('label');
			await expect(cards).toHaveCount(3);

			const boxes = await cards.evaluateAll((els) =>
				els.map((el) => {
					const { x, y, width } = el.getBoundingClientRect();
					return { x, y, width };
				}),
			);
			const form = await page.locator('form[action$="create-comic"]').boundingBox();
			if (sameRow) {
				expect(new Set(boxes.map((b) => Math.round(b.y))).size).toBe(1);
				expect(new Set(boxes.map((b) => Math.round(b.x))).size).toBe(3);
			} else {
				expect(new Set(boxes.map((b) => Math.round(b.y))).size).toBe(3);
				for (const box of boxes) {
					expect(Math.abs(box.width - (form?.width ?? 0))).toBeLessThan(2);
				}
			}
		});
	}
});

test(
	'the checked card has a thicker border than the others',
	{ tag: '@REQ-306-1' },
	async ({ page }) => {
		const createPage = await new CreatePage(page).goto();
		const border = (name: string) =>
			createPage
				.styleRadio(name)
				.locator('xpath=ancestor::label')
				.evaluate((el) => parseFloat(getComputedStyle(el).borderTopWidth));

		const checked = await border(m.styleAnime());
		const other = await border(m.styleClassicMarvel());
		expect(checked).toBeGreaterThan(other);
	},
);

test(
	'a focused style radio shows the focus outline on its card, with no horizontal scroll at 320px',
	{ tag: ['@REQ-038', '@REQ-040'] },
	async ({ page }) => {
		await page.setViewportSize({ width: 320, height: 640 });
		const createPage = await new CreatePage(page).goto();
		const anime = createPage.styleRadio(m.styleAnime());

		await tabTo(page, anime);
		const card = anime.locator('xpath=ancestor::label');
		expect(await card.evaluate((el) => getComputedStyle(el).outlineStyle)).not.toBe('none');
		expect(
			await card.evaluate((el) => parseFloat(getComputedStyle(el).outlineWidth)),
		).toBeGreaterThan(0);

		expect(
			await page.evaluate(
				() => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
			),
		).toBe(true);
	},
);

test(
	'a comic is created with the style chosen by keyboard',
	{ tag: ['@REQ-306-2', '@REQ-005'] },
	async ({ page }) => {
		const createPage = await new CreatePage(page).goto();
		await createPage.pasteStory(STORY);
		await tabTo(page, createPage.styleRadio(m.styleAnime()));
		await page.keyboard.press('ArrowRight');
		await expect(createPage.styleRadio(m.styleClassicMarvel())).toBeChecked();
		await createPage.submit();

		await expect(page).toHaveURL(COMIC_URL);
		await expect(page.locator('dt', { hasText: m.comicStyle() }).locator('+ dd')).toContainText(
			/classic.marvel/i,
		);
		expect((await storedComics(page)).map((comic) => comic.style)).toContain('classic-marvel');
	},
);
