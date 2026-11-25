import { m } from '#lib/paraglide/messages.js';
import { expect, test } from '@playwright/test';
import { storedComics } from '../../../../../tests/e2e/storage';
import { tabTo } from '../../../../../tests/e2e/keyboard';
import { COMIC_STYLES, STYLE_CARDS } from '../../../../../tests/e2e/comicStyles';
import { CreatePage } from './utils/createPage';

const STORY = 'A lighthouse keeper finds a message in a bottle.\nIt leads her to a hidden cove.';
const COMIC_URL = /\/comic\/[0-9a-f-]{36}$/;
const CARD_COUNT = STYLE_CARDS().length;
const COLUMNS = 3;

test(
	'the comic style is a radio group of eleven cards with Anime checked',
	{ tag: '@REQ-306-1' },
	async ({ page }) => {
		const createPage = await new CreatePage(page).goto();
		const group = page.getByRole('group', { name: m.comicStyles() });

		await expect(group).toBeVisible();
		await expect(group.getByRole('radio')).toHaveCount(CARD_COUNT);
		for (const [index, { name, description }] of STYLE_CARDS().entries()) {
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

test.describe('the style cards form a full-width grid', { tag: ['@REQ-306-2', '@REQ-040'] }, () => {
	for (const [width, height] of [
		[1280, 800],
		[390, 844],
		[320, 640],
	]) {
		test(`eleven cards make rows of 3, 3, 3 and 2, filling the width, at ${width}px`, async ({
			page,
		}) => {
			await page.setViewportSize({ width, height });
			await new CreatePage(page).goto();
			const cards = page.getByRole('group', { name: m.comicStyles() }).locator('label');
			await expect(cards).toHaveCount(CARD_COUNT);

			const { boxes, container } = await cards.evaluateAll((els) => {
				const rect = (el: Element) => el.getBoundingClientRect();
				const parent = els[0].parentElement;
				const { x, right } = parent ? rect(parent) : { x: 0, right: 0 };
				return {
					boxes: els.map((el) => ({
						x: rect(el).x,
						right: rect(el).right,
						y: rect(el).y,
						width: rect(el).width,
					})),
					container: { x, right },
				};
			});
			const rowOf = (index: number) => Math.round(boxes[index].y);
			for (let index = 0; index < CARD_COUNT; index++) {
				const rowStart = index - (index % COLUMNS);
				// Cards fill a row left to right, with a gap between neighbours.
				expect(rowOf(index)).toBe(rowOf(rowStart));
				if (index % COLUMNS > 0) {
					expect(boxes[index].x - boxes[index - 1].right).toBeGreaterThan(0);
				}
			}
			// The first column lines up with the form's left edge; a full row's last card with its right edge.
			for (let row = 0; row < CARD_COUNT; row += COLUMNS) {
				expect(Math.abs(boxes[row].x - container.x)).toBeLessThan(1.5);
				if (row + COLUMNS - 1 < CARD_COUNT) {
					expect(Math.abs(boxes[row + COLUMNS - 1].right - container.right)).toBeLessThan(1.5);
				}
			}
			// Each row sits below the one before it, and the cards are as wide as each other.
			for (let row = COLUMNS; row < CARD_COUNT; row += COLUMNS) {
				expect(rowOf(row)).toBeGreaterThan(rowOf(row - COLUMNS));
			}
			expect(Math.abs(boxes[CARD_COUNT - 1].width - boxes[0].width)).toBeLessThan(1.5);

			expect(
				await page.evaluate(
					() => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
				),
			).toBe(true);
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

for (const { id, name } of COMIC_STYLES().slice(1)) {
	test(
		`a comic is created with the ${id} style chosen by keyboard`,
		{ tag: ['@REQ-306-2', '@REQ-005'] },
		async ({ page }) => {
			const createPage = await new CreatePage(page).goto();
			await createPage.pasteStory(STORY);
			await createPage.chooseStyle(name);
			await createPage.submit();

			await expect(page).toHaveURL(COMIC_URL);
			await expect(page.locator('dt', { hasText: m.comicStyle() }).locator('+ dd')).toContainText(
				name,
			);
			expect((await storedComics(page)).map((comic) => comic.style)).toContain(id);
		},
	);
}
