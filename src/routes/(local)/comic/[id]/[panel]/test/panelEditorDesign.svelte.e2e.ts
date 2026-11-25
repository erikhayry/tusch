import { m } from '#lib/paraglide/messages.js';
import { expect, test, type Locator, type Page } from '@playwright/test';
import {
	createComic,
	deletePanel,
	generatePanelImage,
	storedComic,
} from '../../../../../../tests/e2e/createdComic';
import {
	comicWithImage,
	orientationOf,
	panelImages,
	variantCaption,
	type ImageFormat,
} from '../../../../../../tests/e2e/imageFormat';
import { activate } from '../../../../../../tests/e2e/keyboard';
import { panelImageSrc, storedFiles } from '../../../../../../tests/e2e/storage';
import {
	chooseReference,
	cropBytes,
	gotoPanel,
	panelUrl,
	referenceOption,
	referenceOptions,
	submitAndCaptureBody,
} from './utils/characterReferences';
import { PanelCardsPage } from './utils/panelCardsPage';

const WIDE = { width: 1280, height: 920 };
const NARROW = { width: 320, height: 640 };
const VIEWPORTS = [
	{ name: '1280 px', size: WIDE },
	{ name: '320 px', size: NARROW },
] as const;
/** A story of exactly this size, so "after each panel" has a known count. */
const PANEL_COUNT = 3;

/** A user-made comic with `keepPanels` panels left, opened on the panel at `index`. */
async function openCreatedComic(page: Page, index = 1, keepPanels?: number) {
	const comicId = await createComic(page);
	if (keepPanels !== undefined) {
		const count = (await storedComic(page, comicId)).panels.length;
		for (let i = count; i > keepPanels; i--) {
			await deletePanel(page, comicId, 1);
		}
	}
	const cards = new PanelCardsPage(page, comicId);
	await cards.open(index);
	const comic = await storedComic(page, comicId);
	return { cards, comicId, comic, panels: comic.panels };
}

// Every test makes a comic through the UI, and many add images or delete panels first.
test.beforeEach(() => {
	test.slow();
});

const heading = (page: Page, name: string) => page.getByRole('heading', { name, exact: true });

async function topOf(locator: Locator) {
	const box = await locator.boundingBox();
	if (!box) {
		throw new Error(`${locator} has no box`);
	}
	return box;
}

/** The Portrait/Landscape switch: two controls named by the variant (REQ-279-1). */
function variantSwitch(page: Page, variant: 'portrait' | 'landscape') {
	const name = variant === 'portrait' ? m.portraitImage() : m.landscapeImage();
	return page
		.getByRole('radio', { name, exact: true })
		.or(page.getByRole('tab', { name, exact: true }))
		.or(page.getByRole('button', { name, exact: true }));
}

test.describe('breadcrumb', () => {
	test(
		'at 1280 px shows Comics, the title and the current panel, and no "Back to Comic" text link',
		{ tag: '@REQ-323-1' },
		async ({ page }) => {
			await page.setViewportSize(WIDE);
			const { comicId, comic } = await openCreatedComic(page);

			const nav = page.getByRole('navigation', { name: m.breadcrumb(), exact: true });
			await expect(nav).toBeVisible();
			await expect(nav.getByRole('link')).toHaveText([m.comics(), comic.title]);
			await expect(nav.getByRole('link', { name: m.comics(), exact: true })).toHaveAttribute(
				'href',
				'/',
			);
			await expect(nav.getByRole('link', { name: comic.title, exact: true })).toHaveAttribute(
				'href',
				`/comic/${comicId}`,
			);
			const current = nav.locator('[aria-current="page"]');
			await expect(current).toHaveCount(1);
			await expect(current).toHaveText(m.panel({ number: 2 }));
			expect(await current.evaluate((el) => el.closest('a'))).toBeNull();
			await expect(page.getByRole('link', { name: m.backToComic(), exact: true })).toBeHidden();
		},
	);

	test(
		'a comic without a title is "Untitled comic" in the breadcrumb',
		{ tag: '@REQ-323-1' },
		async ({ page }) => {
			await page.setViewportSize(WIDE);
			const comicId = await createComic(page, 'https://example.com/article/mock-error:empty-title');
			const [first] = (await storedComic(page, comicId)).panels;
			await gotoPanel(page, comicId, first.id);

			const nav = page.getByRole('navigation', { name: m.breadcrumb(), exact: true });
			await expect(nav.getByRole('link', { name: m.untitledComic(), exact: true })).toBeVisible();
		},
	);

	test(
		'at 320 px a back-arrow link replaces the breadcrumb and "Read" keeps the name "Read comic"',
		{ tag: ['@REQ-323-1', '@REQ-298-3'] },
		async ({ page }) => {
			await page.setViewportSize(NARROW);
			const { comicId } = await openCreatedComic(page);

			await expect(page.getByRole('navigation', { name: m.breadcrumb() })).toBeHidden();
			const back = page.getByRole('link', { name: m.backToComic(), exact: true });
			await expect(back).toBeVisible();
			await expect(back).toHaveAttribute('href', `/comic/${comicId}`);
			// A compact bar at the top, not a text link at the end of the page.
			expect((await topOf(back)).y).toBeLessThan(NARROW.height / 4);
			const read = page.getByRole('link', { name: m.readThisComic(), exact: true });
			await expect(read).toBeVisible();
			await expect(read).toHaveText(m.read());
			expect((await topOf(read)).y).toBeLessThan(NARROW.height / 4);
		},
	);

	test(
		'at 320 px the top bar and the panel list stay in view while scrolling',
		{ tag: ['@REQ-323-1', '@REQ-238-2'] },
		async ({ page }) => {
			await page.setViewportSize(NARROW);
			const { cards } = await openCreatedComic(page);
			const back = page.getByRole('link', { name: m.backToComic(), exact: true });
			await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
			await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(100);

			expect((await topOf(back)).y).toBeGreaterThanOrEqual(0);
			expect((await topOf(back)).y).toBeLessThan(NARROW.height / 4);
			expect((await topOf(cards.list)).y).toBeGreaterThanOrEqual(0);
			expect((await topOf(cards.list)).y).toBeLessThan(NARROW.height / 2);
		},
	);
});

test.describe('panel list', () => {
	for (const { name, size } of VIEWPORTS) {
		test(
			`at ${name} the list is one row above the content and marks only the current card`,
			{ tag: ['@REQ-238-2', '@REQ-040'] },
			async ({ page }) => {
				await page.setViewportSize(size);
				const { cards, panels } = await openCreatedComic(page);
				expect(panels.length).toBeGreaterThanOrEqual(PANEL_COUNT);

				expect(await cards.rowSpread()).toBeLessThanOrEqual(1);
				await expect(cards.list.locator('a[aria-current]')).toHaveCount(1);
				await expect(cards.link(1)).toHaveAttribute('aria-current', 'page');
				const listBox = await topOf(cards.list);
				const headings = await topOf(heading(page, (await cards.cardTitles())[1]));
				expect(listBox.y + listBox.height).toBeLessThanOrEqual(headings.y);
				const doc = await page.evaluate(() => ({
					scrollWidth: document.documentElement.scrollWidth,
					clientWidth: document.documentElement.clientWidth,
				}));
				expect(doc.scrollWidth).toBeLessThanOrEqual(doc.clientWidth);
			},
		);
	}

	test(
		'offers exactly one "+" button per insertion point, all in the list',
		{ tag: ['@REQ-323-2', '@REQ-021'] },
		async ({ page }) => {
			const { cards, panels } = await openCreatedComic(page, 0, PANEL_COUNT);
			expect(panels).toHaveLength(PANEL_COUNT);
			const names = [
				m.addPanelBefore({ number: 1 }),
				...panels.map((_, index) => m.addPanelAfter({ number: index + 1 })),
			];

			const all = page.getByRole('button', { name: /^Add panel/i });
			await expect(all).toHaveCount(PANEL_COUNT + 1);
			await expect(cards.list.getByRole('button', { name: /^Add panel/i })).toHaveCount(
				PANEL_COUNT + 1,
			);
			for (const name of names) {
				const button = cards.list.getByRole('button', { name, exact: true });
				await expect(button).toHaveCount(1);
				await expect(button).toHaveText('+');
				await expect(button).toHaveAttribute('title', name);
				await expect(button.locator('[aria-hidden="true"]')).toHaveText('+');
			}
		},
	);
});

test.describe('previous and next', () => {
	test(
		'at 1280 px ‹ and › sit at the two ends of the panel list and keep the names Prev and Next',
		{ tag: '@REQ-298-2' },
		async ({ page }) => {
			await page.setViewportSize(WIDE);
			const { cards } = await openCreatedComic(page);
			const prev = page.getByRole('link', { name: m.previousPanel(), exact: true });
			const next = page.getByRole('link', { name: m.nextPanel(), exact: true });

			await expect(prev).toHaveText('‹');
			await expect(next).toHaveText('›');
			await expect(prev.locator('[aria-hidden="true"]')).toHaveCount(1);
			await expect(next.locator('[aria-hidden="true"]')).toHaveCount(1);
			const first = await topOf(cards.link(0));
			const last = await topOf(cards.link((await cards.items.count()) - 1));
			const list = await topOf(cards.list);
			const prevBox = await topOf(prev);
			const nextBox = await topOf(next);
			expect(prevBox.x + prevBox.width).toBeLessThanOrEqual(first.x + 1);
			expect(nextBox.x).toBeGreaterThanOrEqual(last.x + last.width - 1);
			for (const box of [prevBox, nextBox]) {
				expect(box.y).toBeLessThan(list.y + list.height);
				expect(box.y + box.height).toBeGreaterThan(list.y);
			}
		},
	);

	test(
		'at 320 px "← Prev" and "Next →" are pinned to the bottom of the viewport while scrolling',
		{ tag: '@REQ-298-2' },
		async ({ page }) => {
			await page.setViewportSize(NARROW);
			await openCreatedComic(page);
			const prev = page.getByRole('link', { name: m.previousPanel(), exact: true });
			const next = page.getByRole('link', { name: m.nextPanel(), exact: true });
			await expect(prev).toHaveText(`← ${m.previousPanel()}`);
			await expect(next).toHaveText(`${m.nextPanel()} →`);

			for (const scrollTo of [0, 300]) {
				await page.evaluate((y) => window.scrollTo(0, y), scrollTo);
				for (const link of [prev, next]) {
					const box = await topOf(link);
					expect(box.y + box.height).toBeLessThanOrEqual(NARROW.height + 1);
					expect(box.y + box.height).toBeGreaterThan(NARROW.height - 80);
				}
			}
		},
	);

	for (const { edge, index, label } of [
		{ edge: 'first', index: 0, label: m.previousPanel() },
		{ edge: 'last', index: -1, label: m.nextPanel() },
	]) {
		test(
			`at 320 px the disabled ${label} on the ${edge} panel is pinned to the bottom too`,
			{ tag: '@REQ-298-2' },
			async ({ page }) => {
				await page.setViewportSize(NARROW);
				await openCreatedComic(page, index);
				const disabled = page
					.locator('[aria-disabled="true"]')
					.filter({ hasText: label })
					.filter({ visible: true });

				await expect(disabled).toHaveCount(1);
				const box = await topOf(disabled);
				expect(box.y + box.height).toBeLessThanOrEqual(NARROW.height + 1);
				expect(box.y + box.height).toBeGreaterThan(NARROW.height - 80);
			},
		);
	}
});

test.describe('image section', () => {
	for (const { format, other } of [
		{ format: 'portrait', other: 'landscape' },
		{ format: 'landscape', other: 'portrait' },
	] as const satisfies readonly { format: ImageFormat; other: 'portrait' | 'landscape' }[]) {
		test(
			`a ${format}-only comic can switch to ${other}, which shows "Create ${other} image" and never changes the format`,
			{ tag: '@REQ-279-1' },
			async ({ page }) => {
				const { comicId, panelId } = await comicWithImage(page, format);
				await gotoPanel(page, comicId, panelId);
				await expect(panelImages(page)).toHaveCount(1);
				expect(await orientationOf(panelImages(page))).toBe(format);

				// Fail here, clearly, when the switch is missing, instead of tabbing 80 times.
				await expect(variantSwitch(page, other)).toBeVisible();
				await activate(page, variantSwitch(page, other));

				const create = page.getByRole('button', {
					name: other === 'portrait' ? m.createPortraitImage() : m.createLandscapeImage(),
					exact: true,
				});
				await expect(create).toBeVisible();
				await expect(panelImages(page)).toHaveCount(0);
				await page.reload();
				await expect(panelImages(page)).toHaveCount(1);
				expect(await orientationOf(panelImages(page))).toBe(format);
				expect((await storedComic(page, comicId)).imageFormat).toBe(format);

				await activate(page, variantSwitch(page, other));
				await activate(page, variantSwitch(page, format));
				await expect(panelImages(page)).toHaveCount(1);
				expect((await storedComic(page, comicId)).imageFormat).toBe(format);
			},
		);
	}

	test(
		'"Restore previous image" sits next to Remove',
		{ tag: ['@REQ-279-1', '@REQ-048'] },
		async ({ page }) => {
			await page.setViewportSize(WIDE);
			const { comicId, panelId } = await comicWithImage(page, 'portrait');
			await gotoPanel(page, comicId, panelId);
			const before = await panelImageSrc(page, comicId, panelId);
			await activate(page, page.getByRole('button', { name: m.generateNewImage(), exact: true }));
			await expect.poll(() => panelImageSrc(page, comicId, panelId)).not.toBe(before);

			const restore = page.getByRole('button', { name: m.restorePreviousImage(), exact: true });
			const remove = page.getByRole('button', { name: m.removeImage(), exact: true });
			await expect(restore).toBeVisible();
			const restoreBox = await topOf(restore);
			const removeBox = await topOf(remove);
			expect(Math.abs(restoreBox.y - removeBox.y)).toBeLessThan(removeBox.height);
			const gap = Math.max(
				restoreBox.x - (removeBox.x + removeBox.width),
				removeBox.x - (restoreBox.x + restoreBox.width),
			);
			expect(gap).toBeLessThan(48);
		},
	);

	for (const { name, size, sideBySide } of [
		{ name: '1280 px', size: WIDE, sideBySide: true },
		{ name: '320 px', size: NARROW, sideBySide: false },
	]) {
		test(
			`a "Portrait and landscape" comic shows both images ${sideBySide ? 'side by side' : 'stacked'} at ${name}, each with a caption and Remove button, and no switch`,
			{ tag: ['@REQ-323-3', '@REQ-103-4', '@REQ-279-2'] },
			async ({ page }) => {
				await page.setViewportSize(size);
				const { comicId, panelId } = await comicWithImage(page, 'both');
				await gotoPanel(page, comicId, panelId);

				const images = panelImages(page);
				await expect(images).toHaveCount(2);
				await expect(variantCaption(page, 'portrait')).toBeVisible();
				await expect(variantCaption(page, 'landscape')).toBeVisible();
				await expect(
					page.getByRole('button', { name: m.removePortraitImage(), exact: true }),
				).toBeVisible();
				await expect(
					page.getByRole('button', { name: m.removeLandscapeImage(), exact: true }),
				).toBeVisible();
				await expect(variantSwitch(page, 'portrait')).toHaveCount(0);
				await expect(variantSwitch(page, 'landscape')).toHaveCount(0);

				const [a, b] = await Promise.all([topOf(images.nth(0)), topOf(images.nth(1))]);
				if (sideBySide) {
					expect(Math.abs(a.y - b.y)).toBeLessThanOrEqual(1);
					expect(a.x + a.width).toBeLessThanOrEqual(b.x + 1);
					// About 3:4 widths: the portrait image is the narrower one.
					const ratio = Math.min(a.width, b.width) / Math.max(a.width, b.width);
					expect(ratio).toBeGreaterThan(0.6);
					expect(ratio).toBeLessThan(0.9);
				} else {
					expect(a.y + a.height).toBeLessThanOrEqual(b.y + 1);
				}
			},
		);
	}
});

test(
	'the page has the headings Scene, Generate image, Captions and Dialogue in that order, with the scene facts under Scene',
	{ tag: '@REQ-323-3' },
	async ({ page }) => {
		const { cards } = await openCreatedComic(page, 0);
		await generatePanelImage(
			page,
			cards.comicId,
			(await storedComic(page, cards.comicId)).panels[0].id,
		);
		await cards.open(0);

		const ys: number[] = [];
		for (const name of [m.scene(), m.generateImage(), m.captions(), m.dialogues()]) {
			await expect(heading(page, name)).toHaveCount(1);
			ys.push((await topOf(heading(page, name))).y);
		}
		expect(ys).toEqual([...ys].sort((a, b) => a - b));
		for (const label of [m.timeOfDay(), m.season(), m.year()]) {
			const y = (await topOf(page.getByText(label).first())).y;
			expect(y).toBeGreaterThan(ys[0]);
			expect(y).toBeLessThan(ys[1]);
		}
	},
);

test.describe('character references', () => {
	/** Panels 1 and 2 have images (so crops); the character who speaks in panels 1, 2 and 3 has two options on 3. */
	async function openThirdPanel(page: Page) {
		const comicId = await createComic(page);
		const { panels, characters } = await storedComic(page, comicId);
		const [a, b, c] = panels;
		await generatePanelImage(page, comicId, a.id);
		await generatePanelImage(page, comicId, b.id);
		const comic = await storedComic(page, comicId);
		const speaksIn = (panelId: string) =>
			comic.panels.find(({ id }) => id === panelId)?.dialogue.map(({ characterId }) => characterId);
		const character = characters.find(
			({ id }) =>
				speaksIn(a.id)?.includes(id) &&
				speaksIn(b.id)?.includes(id) &&
				speaksIn(c.id)?.includes(id),
		);
		if (!character) {
			throw new Error('mock comic needs a character who speaks in panels 1, 2 and 3');
		}
		await gotoPanel(page, comicId, c.id);
		return { comicId, a, b, c, character: comic.characters.find(({ id }) => id === character.id) };
	}

	test(
		'a toggle presses and releases its character’s other choice, pressing it again clears it, and the header counts characters',
		{ tag: ['@REQ-323-4', '@REQ-100-2'] },
		async ({ page }) => {
			const { character } = await openThirdPanel(page);
			if (!character) {
				throw new Error('character vanished');
			}
			const first = referenceOption(page, character.name, 1);
			const second = referenceOption(page, character.name, 2);
			await expect(referenceOptions(page, character.name)).toHaveCount(2);
			await expect(first).toHaveAttribute('aria-pressed', 'false');
			await expect(page.getByText(m.referencesSelected({ count: 1 }), { exact: true })).toHaveCount(
				0,
			);

			await chooseReference(page, character.name, 1);
			await expect(second).toHaveAttribute('aria-pressed', 'false');
			await expect(
				page.getByText(m.referencesSelected({ count: 1 }), { exact: true }),
			).toBeVisible();

			await chooseReference(page, character.name, 2);
			await expect(first).toHaveAttribute('aria-pressed', 'false');
			await expect(
				page.getByText(m.referencesSelected({ count: 1 }), { exact: true }),
			).toBeVisible();

			await chooseReference(page, character.name, 2, false);
			await expect(first).toHaveAttribute('aria-pressed', 'false');
			await expect(page.getByText(m.referencesSelected({ count: 1 }), { exact: true })).toHaveCount(
				0,
			);
		},
	);

	test(
		'the toggles are 44 by 44 px in a row that scrolls sideways, and generating sends only the pressed one',
		{ tag: ['@REQ-323-4', '@REQ-100-2'] },
		async ({ page }) => {
			const { comicId, a, character } = await openThirdPanel(page);
			if (!character) {
				throw new Error('character vanished');
			}
			const first = referenceOption(page, character.name, 1);
			for (const option of await referenceOptions(page, character.name).all()) {
				const box = await topOf(option);
				expect(box.width).toBeCloseTo(44, 0);
				expect(box.height).toBeCloseTo(44, 0);
			}
			const scrolls = await first.evaluate((el) => {
				for (let node = el.parentElement; node; node = node.parentElement) {
					const { overflowX } = getComputedStyle(node);
					if (overflowX === 'auto' || overflowX === 'scroll') {
						return true;
					}
				}
				return false;
			});
			expect(scrolls).toBe(true);

			const crop = character.images.find(({ panelId }) => panelId === a.id);
			if (!crop) {
				throw new Error('mock comic needs a crop of the character in panel 1');
			}
			const bytes = await cropBytes(page, crop);
			await chooseReference(page, character.name, 1);
			const body = await submitAndCaptureBody(
				page,
				page.getByRole('button', { name: m.addImage() }),
			);

			expect(body.split(bytes.full).length - 1).toBe(1);
			await expect(page.getByRole('img', { name: 'mock alt text' }).first()).toBeVisible();
			expect((await storedComic(page, comicId)).panels[2].image).toBeDefined();
		},
	);
});

test.describe('delete panel', () => {
	const deleteButton = (page: Page, number: number) =>
		page.getByRole('button', { name: m.deletePanel({ number }), exact: true });

	async function deletePanelFromPage(page: Page, number: number) {
		await expect(deleteButton(page, number)).toBeVisible();
		await activate(page, deleteButton(page, number));
	}

	test(
		'Delete Panel 2 removes it without confirming and opens panel 1',
		{ tag: ['@REQ-323-5', '@REQ-013', '@REQ-047'] },
		async ({ page }) => {
			const { cards, comicId, panels } = await openCreatedComic(page, 1, PANEL_COUNT);
			await generatePanelImage(page, comicId, panels[1].id);
			const file = await panelImageSrc(page, comicId, panels[1].id);
			expect(file).toBeDefined();
			await gotoPanel(page, comicId, panels[1].id);
			// Below the cards: after the Dialogue heading.
			await expect(deleteButton(page, 2)).toBeVisible();
			expect((await topOf(deleteButton(page, 2))).y).toBeGreaterThan(
				(await topOf(heading(page, m.dialogues()))).y,
			);

			await deletePanelFromPage(page, 2);

			await expect(page).toHaveURL(panelUrl(comicId, panels[0].id));
			await expect(cards.items).toHaveCount(PANEL_COUNT - 1);
			const stored = await storedComic(page, comicId);
			expect(stored.panels.map(({ id }) => id)).toEqual([panels[0].id, panels[2].id]);
			expect(await storedFiles(page)).not.toContain(file);
		},
	);

	test(
		'deleting the first panel opens the new first panel',
		{ tag: ['@REQ-323-5', '@REQ-013'] },
		async ({ page }) => {
			const { comicId, panels } = await openCreatedComic(page, 0, PANEL_COUNT);

			await deletePanelFromPage(page, 1);

			await expect(page).toHaveURL(panelUrl(comicId, panels[1].id));
			await expect(heading(page, m.dialogues())).toBeVisible();
		},
	);

	test(
		'deleting the only panel opens the comic page',
		{ tag: ['@REQ-323-5', '@REQ-013'] },
		async ({ page }) => {
			const { comicId } = await openCreatedComic(page, 0, 1);

			await deletePanelFromPage(page, 1);

			await expect(page).toHaveURL(`/comic/${comicId}`);
			expect((await storedComic(page, comicId)).panels).toHaveLength(0);
		},
	);
});

test.describe('sizes', () => {
	for (const { name, size } of VIEWPORTS) {
		test(
			`at ${name} every visible button and link is at least 44 px tall and dialogue avatars are ${size.width === 1280 ? 28 : 24} px`,
			{ tag: ['@REQ-323-6', '@REQ-040'] },
			async ({ page }) => {
				await page.setViewportSize(size);
				const { comicId, panels } = await openCreatedComic(page, 0);
				await generatePanelImage(page, comicId, panels[0].id);
				await gotoPanel(page, comicId, panels[0].id);
				await expect(
					page.getByRole('list', { name: m.dialogues() }).getByRole('img').first(),
				).toBeVisible();

				const small = await page.evaluate(() =>
					[...document.querySelectorAll('a[href], button')]
						// The site header (REQ-294-1) is not part of the panel editor.
						.filter((el) => !el.closest('header.header'))
						.map((el) => ({ el, rect: el.getBoundingClientRect() }))
						.filter(({ el, rect }) => {
							const { visibility } = getComputedStyle(el);
							return visibility !== 'hidden' && rect.width > 1 && rect.height > 1;
						})
						.filter(({ rect }) => rect.height < 43.5)
						.map(
							({ el, rect }) =>
								`${el.tagName} "${el.getAttribute('aria-label') ?? el.textContent?.trim()}" ${rect.height}px`,
						),
				);
				expect(small).toEqual([]);

				const avatars = await page
					.getByRole('list', { name: m.dialogues() })
					.getByRole('img')
					.all();
				expect(avatars.length).toBeGreaterThan(0);
				const expected = size.width === 1280 ? 28 : 24;
				for (const avatar of avatars) {
					const box = await topOf(avatar);
					expect(box.width).toBeCloseTo(expected, 0);
					expect(box.height).toBeCloseTo(expected, 0);
				}
			},
		);
	}
});
