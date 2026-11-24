import { expect, test, type Page } from '@playwright/test';
import {
	createComic,
	generatePanelImage,
	storedComic,
} from '../../../../../../tests/e2e/createdComic';
import { tabTo } from '../../../../../../tests/e2e/keyboard';
import { PanelCardsPage } from './utils/panelCardsPage';

/** Wide enough to overflow the list at every tested viewport (cards are narrower than 100 px each). */
const OVERFLOWING_PANELS = 16;
/** Below 48em the list is a horizontal row; from 48em it is a column (panelEditor.svelte.e2e.ts). */
const NARROW_VIEWPORT = { width: 320, height: 640 };

/** A comic made through the UI, opened on one of its panels. */
async function openCreatedComic(page: Page, panelIndex = 0) {
	const cards = new PanelCardsPage(page, await createComic(page));
	await cards.open(panelIndex);
	return cards;
}

/** A user-made comic with enough panels to overflow the list, opened on the panel at `panelIndex`. */
async function openOverflowingComic(page: Page, panelIndex = 0) {
	test.slow();
	await page.setViewportSize(NARROW_VIEWPORT);
	const cards = await openCreatedComic(page);
	await cards.addPanelsUntil(OVERFLOWING_PANELS);
	await cards.open(panelIndex);
	return cards;
}

test(
	'a card with a stored image links to the panel with an empty-alt image and the title as its name',
	{ tag: '@REQ-238-1' },
	async ({ page }) => {
		const cards = await openCreatedComic(page);
		const [firstPanel] = (await storedComic(page, cards.comicId)).panels;
		await generatePanelImage(page, cards.comicId, firstPanel.id);
		await cards.open();

		const [title] = await cards.cardTitles();
		const link = cards.link(0);
		await expect(link).toHaveAccessibleName(title);
		await expect(link.locator('img')).toHaveCount(1);
		await expect(link.locator('img')).toHaveAttribute('alt', '');
		await expect(link.locator('img')).toBeVisible();

		// Panels without an image keep the thumbnail's size, so the row does not jump.
		const placeholder = cards.link(1).locator('span[aria-hidden="true"]');
		const imageBox = await link.locator('img').boundingBox();
		const placeholderBox = await placeholder.boundingBox();
		expect(imageBox?.width).toBeGreaterThan(0);
		expect(placeholderBox?.width).toBeCloseTo(imageBox?.width ?? -1, 0);
		expect(placeholderBox?.height).toBeCloseTo(imageBox?.height ?? -1, 0);
	},
);

test(
	'a card without an image shows a hidden same-ratio placeholder and is named by the title',
	{ tag: '@REQ-238-1' },
	async ({ page }) => {
		const cards = await openCreatedComic(page);
		const titles = await cards.cardTitles();
		expect(titles.length).toBeGreaterThanOrEqual(3);
		await expect(cards.items).toHaveCount(titles.length);

		for (const [index, title] of titles.entries()) {
			const link = cards.link(index);
			await expect(link).toHaveAccessibleName(title);
			await expect(link.locator('img')).toHaveCount(0);

			const placeholder = link.locator('span[aria-hidden="true"]');
			await expect(placeholder).toHaveCount(1);
			await expect(placeholder).toHaveText('');
			const box = await placeholder.boundingBox();
			expect(box?.width).toBeGreaterThan(0);
			// 2:3 thumbnail box, as the comic page's thumbnails.
			expect((box?.width ?? 0) / (box?.height ?? 1)).toBeCloseTo(2 / 3, 1);
		}
	},
);

test(
	'the panel list is one row that scrolls inside its own box at 320 px',
	{ tag: ['@REQ-238-2', '@REQ-040'] },
	async ({ page }) => {
		const cards = await openOverflowingComic(page);

		await expect(cards.items).toHaveCount(OVERFLOWING_PANELS);
		expect(await cards.rowSpread()).toBeLessThanOrEqual(1);
		const { scrollWidth, clientWidth } = await cards.scrollSize();
		expect(scrollWidth).toBeGreaterThan(clientWidth);

		const page_ = await page.evaluate(() => ({
			scrollWidth: document.documentElement.scrollWidth,
			clientWidth: document.documentElement.clientWidth,
		}));
		expect(page_.scrollWidth).toBeLessThanOrEqual(page_.clientWidth);
	},
);

test(
	'the current panel card is scrolled into view and is the only one marked as current at 320 px',
	{ tag: '@REQ-238-2' },
	async ({ page }) => {
		const cards = await openOverflowingComic(page, -1);
		const { scrollWidth, clientWidth } = await cards.scrollSize();
		expect(scrollWidth).toBeGreaterThan(clientWidth);

		const last = cards.link(OVERFLOWING_PANELS - 1);
		await expect.poll(() => cards.isInsideListBox(last)).toBe(true);
		await expect(last).toHaveAttribute('aria-current', 'page');
		await expect(cards.list.locator('a[aria-current]')).toHaveCount(1);
	},
);

test(
	'tabbing through the list reaches every card link and insert button in order with a focus outline',
	{ tag: ['@REQ-238-2', '@REQ-038', '@REQ-037'] },
	async ({ page }) => {
		const cards = await openOverflowingComic(page);
		const last = cards.link(OVERFLOWING_PANELS - 1);
		// On the first panel the last card is off-screen; focus has to bring it into view.
		expect(await cards.isInsideListBox(last)).toBe(false);

		const controls = await cards.controls.all();
		// One link per card plus the "after" buttons and the first card's "before" button.
		expect(controls.length).toBe(OVERFLOWING_PANELS * 2 + 1);

		for (const control of controls) {
			await tabTo(page, control);
			const outline = await control.evaluate((el) => {
				const { outlineStyle, outlineWidth } = getComputedStyle(el);
				return outlineStyle !== 'none' && parseFloat(outlineWidth) > 0;
			});
			expect(outline).toBe(true);
			if ((await control.evaluate((el) => el.tagName)) === 'A') {
				await expect.poll(() => cards.isInsideListBox(control)).toBe(true);
			}
		}
		expect(await cards.isInsideListBox(last)).toBe(true);
	},
);
