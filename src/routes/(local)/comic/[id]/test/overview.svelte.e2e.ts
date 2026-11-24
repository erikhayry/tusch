import { m } from '#lib/paraglide/messages.js';
import { expect, test, type Page } from '@playwright/test';
import {
	createComic,
	generatePanelImage,
	storedComic,
} from '../../../../../tests/e2e/createdComic';
import {
	EXAMPLE_COMPLETE,
	exampleMinimal,
	exampleNoImages,
} from '../../../../../tests/e2e/examples';
import { gotoHydrated } from '../../../../../tests/e2e/gotoHydrated';
import {
	IMAGE_FORMATS,
	selectedImageFormat,
	setImageFormat,
} from '../../../../../tests/e2e/imageFormat';
import { tabTo } from '../../../../../tests/e2e/keyboard';
import { PanelPage } from '../[panel]/test/utils/panelPage';
import {
	ANY_PANEL_META,
	appearsInLabel,
	CARD_HEADINGS,
	comicMeta,
	owningCard,
	panelMeta,
	panelsListedFor,
	precedes,
	panelStrip,
	removeStoredCharacters,
} from './utils/overview';

const NARROW = { width: 320, height: 640 };

const characterItem = (page: Page, name: string) =>
	page
		.locator('ul[aria-labelledby="characters"] > li')
		.filter({ has: page.getByRole('heading', { name, level: 3, exact: true }) });

test.describe('comic overview headings', () => {
	test(
		'four h2 cards in order, characters and setting are h3, style and source are a list',
		{ tag: ['@REQ-236-2', '@REQ-014'] },
		async ({ page }) => {
			await gotoHydrated(page, `/comic/${EXAMPLE_COMPLETE.id}`);

			const h2s = page.getByRole('heading', { level: 2 });
			await expect(h2s).toHaveText(CARD_HEADINGS());

			const h3s = page.getByRole('heading', { level: 3 });
			const expected = [...EXAMPLE_COMPLETE.characters.map(({ name }) => name)];
			if (EXAMPLE_COMPLETE.setting) {
				expected.push(m.setting());
			}
			await expect(h3s).toHaveText(expected);
			for (const { name } of EXAMPLE_COMPLETE.characters) {
				expect(await owningCard(page.getByRole('heading', { name, level: 3, exact: true }))).toBe(
					m.characters(),
				);
			}
			if (EXAMPLE_COMPLETE.setting) {
				const setting = page.getByRole('heading', { name: m.setting(), level: 3, exact: true });
				expect(await owningCard(setting)).toBe(m.comicSettings());
			}

			for (const name of [m.comicStyle(), m.source()]) {
				await expect(page.getByRole('heading', { name })).toHaveCount(0);
				await expect(page.locator('dt', { hasText: name })).toHaveCount(1);
			}
		},
	);

	test('a created comic has the same four cards', { tag: '@REQ-236-2' }, async ({ page }) => {
		const comicId = await createComic(page);
		await gotoHydrated(page, `/comic/${comicId}`);

		await expect(page.getByRole('heading', { level: 2 })).toHaveText(CARD_HEADINGS());
		await expect(page.locator('dt', { hasText: m.comicStyle() })).toHaveCount(1);
		await expect(page.locator('dt', { hasText: m.source() })).toHaveCount(1);
	});

	test(
		'Back comes before the h1, View comic after it, both before the first h2',
		{ tag: '@REQ-87-1' },
		async ({ page }) => {
			const comicId = await createComic(page);
			await gotoHydrated(page, `/comic/${comicId}`);

			const back = page.getByRole('link', { name: m.back(), exact: true });
			const view = page.getByRole('link', { name: m.viewComic(), exact: true });
			const h1 = page.getByRole('heading', { level: 1 });
			const firstH2 = page.getByRole('heading', { level: 2 }).first();
			await expect(back).toHaveAttribute('href', '/');

			expect(await precedes(back, h1)).toBe(true);
			expect(await precedes(h1, view)).toBe(true);
			expect(await precedes(view, firstH2)).toBe(true);
		},
	);

	test(
		'the cover forms sit in the Cover card and the image format in Comic settings',
		{ tag: ['@REQ-012', '@REQ-280-1', '@REQ-103-1'] },
		async ({ page }) => {
			// A created comic has both cover variants; the example's cover has one.
			const comicId = await createComic(page);
			const cases = [
				{ id: comicId, names: [m.removePortraitCover(), m.removeLandscapeCover()] },
				{ id: EXAMPLE_COMPLETE.id, names: [m.deleteCover()] },
			];
			for (const { id, names } of cases) {
				await gotoHydrated(page, `/comic/${id}`);
				for (const name of names) {
					const button = page.getByRole('button', { name, exact: true });
					expect(await owningCard(button)).toBe(m.cover());
					// WCAG 2.5.3: the visible text is part of the accessible name, and starts it.
					const visible = (await button.innerText()).trim();
					expect(visible).not.toBe('');
					await expect(button).toHaveAccessibleName(new RegExp(`^${visible}`, 'i'));
				}
			}

			await gotoHydrated(page, `/comic/${exampleNoImages().id}`);
			const add = page.getByRole('button', { name: m.addCover(), exact: true });
			expect(await owningCard(add)).toBe(m.cover());
			const format = page.getByRole('combobox', { name: m.imageFormat(), exact: true });
			expect(await owningCard(format)).toBe(m.comicSettings());
		},
	);

	test(
		'the image format saved from the Comic settings card is stored',
		{ tag: '@REQ-103-1' },
		async ({ page }) => {
			const comicId = await createComic(page);
			await setImageFormat(page, comicId, 'portrait');

			await page.reload();
			await expect.poll(() => selectedImageFormat(page)).toBe(IMAGE_FORMATS.portrait());
			const format = page.getByRole('combobox', { name: m.imageFormat(), exact: true });
			expect(await owningCard(format)).toBe(m.comicSettings());
		},
	);
});

test.describe('comic overview meta', () => {
	test(
		'the meta line shows the panel and character counts, with no Example part',
		{ tag: '@REQ-297-1' },
		async ({ page }) => {
			const comicId = await createComic(page);
			for (const comic of [await storedComic(page, comicId), EXAMPLE_COMPLETE, exampleMinimal()]) {
				await gotoHydrated(page, `/comic/${comic.id}`);
				const meta = page.getByText(comicMeta(comic), { exact: true });
				await expect(meta).toBeVisible();
				await expect(page.getByText(m.exampleComic(), { exact: true })).toHaveCount(0);
				// Under the title, above the first card.
				expect(await precedes(page.getByRole('heading', { level: 1 }), meta)).toBe(true);
				expect(await precedes(meta, page.getByRole('heading', { level: 2 }).first())).toBe(true);
			}

			// Singular for one, and the characters part only when there are characters.
			expect(comicMeta(exampleMinimal())).toContain(m.panelCountOne());
			expect(comicMeta(exampleMinimal())).toContain(m.characterCountOne());
		},
	);

	test(
		'a comic without characters shows only the panel count',
		{ tag: '@REQ-297-1' },
		async ({ page }) => {
			const comicId = await createComic(page);
			await removeStoredCharacters(page, comicId);
			await gotoHydrated(page, `/comic/${comicId}`);

			const comic = await storedComic(page, comicId);
			expect(comic.characters).toHaveLength(0);
			await expect(page.getByText(comicMeta(comic), { exact: true })).toBeVisible();
			expect(comicMeta(comic)).not.toContain('·');
		},
	);

	test(
		'a panel card shows its number, title and caption and line counts',
		{ tag: '@REQ-297-2' },
		async ({ page }) => {
			const comicId = await createComic(page);
			for (const comic of [await storedComic(page, comicId), EXAMPLE_COMPLETE]) {
				await gotoHydrated(page, `/comic/${comic.id}`);
				const cards = panelStrip(page).getByRole('listitem');
				await expect(cards).toHaveCount(comic.panels.length);

				for (const [index, panel] of comic.panels.entries()) {
					const card = cards.nth(index);
					await expect(card.getByRole('link', { name: panel.editorialTitle })).toBeVisible();
					await expect(card).toContainText(String(index + 1));
					await expect(card.getByText(panelMeta(panel), { exact: true })).toBeVisible();
				}
			}

			// Both counts in one line, joined by " · ".
			expect(panelMeta(EXAMPLE_COMPLETE.panels[0])).toBe(
				`${m.captionCountOne()} · ${m.lineCount({ count: 2 })}`,
			);
		},
	);

	test(
		'zero counts are left out, and a panel with neither has no meta line',
		{ tag: '@REQ-297-2' },
		async ({ page }) => {
			const comicId = await createComic(page);
			const before = await storedComic(page, comicId);
			const [bare, noLines] = before.panels;
			expect(bare.captions.length).toBeGreaterThan(0);
			expect(noLines.captions.length).toBeGreaterThan(0);

			// Remove the text through the UI, as a user would: all of the first panel's, and
			// only the dialogue of the second.
			const panelPage = new PanelPage(page);
			await gotoHydrated(page, `/comic/${comicId}/${bare.id}`);
			for (let remaining = bare.captions.length; remaining > 0; remaining--) {
				await panelPage.removeCaption();
				await expect(
					page.getByRole('button', { name: m.deleteCaption({ number: remaining }) }),
				).toHaveCount(0);
			}
			for (let remaining = bare.dialogue.length; remaining > 0; remaining--) {
				await panelPage.removeDialogue();
				await expect(
					page.getByRole('button', { name: m.deleteDialogue({ number: remaining }) }),
				).toHaveCount(0);
			}
			await gotoHydrated(page, `/comic/${comicId}/${noLines.id}`);
			for (let remaining = noLines.dialogue.length; remaining > 0; remaining--) {
				await panelPage.removeDialogue();
				await expect(
					page.getByRole('button', { name: m.deleteDialogue({ number: remaining }) }),
				).toHaveCount(0);
			}

			const after = await storedComic(page, comicId);
			expect(after.panels[0].captions).toHaveLength(0);
			expect(after.panels[0].dialogue).toHaveLength(0);
			expect(after.panels[1].dialogue).toHaveLength(0);

			await gotoHydrated(page, `/comic/${comicId}`);
			const cards = panelStrip(page).getByRole('listitem');
			await expect(cards.nth(0).getByRole('link', { name: bare.editorialTitle })).toBeVisible();
			await expect(cards.nth(0).getByText(ANY_PANEL_META())).toHaveCount(0);
			await expect(cards.nth(0).getByText('·')).toHaveCount(0);

			const captionsOnly = cards.nth(1).getByText(ANY_PANEL_META());
			await expect(captionsOnly).toHaveCount(1);
			await expect(captionsOnly).toHaveText(panelMeta(after.panels[1]));
			expect(panelMeta(after.panels[1])).not.toContain('·');
		},
	);

	test(
		'a character shows how many panels it appears in',
		{ tag: ['@REQ-297-3', '@REQ-014'] },
		async ({ page }) => {
			// The example: each character is in several panels.
			await gotoHydrated(page, `/comic/${EXAMPLE_COMPLETE.id}`);
			for (const { id, name } of EXAMPLE_COMPLETE.characters) {
				const count = panelsListedFor(EXAMPLE_COMPLETE, id);
				expect(count).toBeGreaterThan(1);
				await expect(
					characterItem(page, name).getByText(appearsInLabel(count), { exact: true }),
				).toBeVisible();
			}

			// A created comic: none, then one, then two panels with an image.
			const comicId = await createComic(page);
			const created = await storedComic(page, comicId);
			const [first, second] = created.panels;
			const expectCounts = async (expected: number) => {
				await gotoHydrated(page, `/comic/${comicId}`);
				const comic = await storedComic(page, comicId);
				for (const { id, name } of comic.characters) {
					expect(panelsListedFor(comic, id)).toBe(expected);
					await expect(
						characterItem(page, name).getByText(appearsInLabel(expected), { exact: true }),
					).toBeVisible();
				}
			};
			await expectCounts(0);
			await generatePanelImage(page, comicId, first.id);
			await expectCounts(1);
			await generatePanelImage(page, comicId, second.id);
			await expectCounts(2);
		},
	);
});

test.describe('comic overview panel strip', () => {
	test.describe('at 320 px', () => {
		test.use({ viewport: NARROW });

		test(
			'only the strip scrolls sideways and every panel link is reachable with a focus ring',
			{ tag: ['@REQ-040', '@REQ-037', '@REQ-038', '@REQ-010'] },
			async ({ page }) => {
				await gotoHydrated(page, `/comic/${EXAMPLE_COMPLETE.id}`);
				await page.waitForLoadState('networkidle');

				const document_ = await page.evaluate(() => ({
					scrollWidth: document.documentElement.scrollWidth,
					clientWidth: document.documentElement.clientWidth,
				}));
				expect(document_.scrollWidth).toBeLessThanOrEqual(document_.clientWidth);

				const strip = panelStrip(page);
				const size = await strip.evaluate((el) => ({
					scrollWidth: el.scrollWidth,
					clientWidth: el.clientWidth,
					overflowX: getComputedStyle(el).overflowX,
				}));
				expect(size.scrollWidth).toBeGreaterThan(size.clientWidth);
				expect(['auto', 'scroll']).toContain(size.overflowX);

				for (const { editorialTitle } of EXAMPLE_COMPLETE.panels) {
					const link = strip.getByRole('link', { name: editorialTitle });
					await tabTo(page, link);
					const ring = await link.evaluate((el) => {
						const style = getComputedStyle(el);
						return style.outlineStyle !== 'none' && parseFloat(style.outlineWidth) > 0;
					});
					expect(ring).toBe(true);
				}

				// Only the sideways hint for this width is shown (and read).
				await expect(page.getByText(m.panelStripHintNarrow(), { exact: true })).toBeVisible();
				await expect(page.getByText(m.panelStripHint(), { exact: true })).toBeHidden();
			},
		);
	});

	test(
		'the wide hint is shown at 1280 px, the narrow one is hidden',
		{ tag: '@REQ-010' },
		async ({ page }) => {
			await gotoHydrated(page, `/comic/${EXAMPLE_COMPLETE.id}`);

			await expect(page.getByText(m.panelStripHint(), { exact: true })).toBeVisible();
			await expect(page.getByText(m.panelStripHintNarrow(), { exact: true })).toBeHidden();
		},
	);
});
