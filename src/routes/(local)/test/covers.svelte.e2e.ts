import { m } from '#lib/paraglide/messages.js';
import { primaryVariant } from '#lib/types/image-variants.ts';
import { expect, test, type Locator, type Page } from '@playwright/test';
import { createComic, storedComic } from '../../../tests/e2e/createdComic';
import {
	EXAMPLE_COMPLETE as EXAMPLE,
	exampleMinimal,
	exampleNoImages,
} from '../../../tests/e2e/examples';
import { deleteCover } from '../../../tests/e2e/cover';
import { gotoHydrated } from '../../../tests/e2e/gotoHydrated';
import { activate, tabTo } from '../../../tests/e2e/keyboard';
import { LANDING_COPY } from '../../../tests/e2e/landingCopy';
import { LandingPage } from './utils/landingPage';

const MISSING_IMAGE = '/missing-image.svg';

/** A comic made through the UI (it gets a cover from the mock gateway), and its title and cover file. */
async function createdComicWithCover(page: Page) {
	const id = await createComic(page);
	const { title, cover } = await storedComic(page, id);
	const coverFile = primaryVariant(cover)?.asset.src;
	if (!coverFile) {
		throw new Error('created comic has no cover');
	}
	return { id, title, coverFile };
}

test.describe('covers on the landing page', () => {
	test(
		'a created comic shows its cover in a card with no link around it',
		{ tag: '@REQ-235-1' },
		async ({ page }) => {
			const { title } = await createdComicWithCover(page);
			const landingPage = await new LandingPage(page).goto();

			const card = landingPage.card(title);
			const image = card.locator('img');
			await expect(image).toHaveCount(1);
			await expect(image).toHaveAttribute('alt', '');
			await expect(image).not.toHaveAttribute('src', MISSING_IMAGE);
			await expect(image).toBeVisible();
			await expect(card.getByText(title, { exact: true })).toBeVisible();
			await expect(card.getByRole('link').locator('img')).toHaveCount(0);
			await expect(card.getByRole('link', { name: title, exact: true })).toHaveCount(0);
		},
	);

	test(
		'names Read and Edit after the comic and opens them with the keyboard',
		{ tag: ['@REQ-235-1', '@REQ-001'] },
		async ({ page }) => {
			const { id, title } = await createdComicWithCover(page);
			const landingPage = await new LandingPage(page).goto();

			await expect(landingPage.card(title).getByRole('link')).toHaveCount(2);
			await expect(landingPage.readLink(title)).toHaveAttribute('href', `/comic/${id}/view`);
			await expect(landingPage.editLink(title)).toHaveAttribute('href', `/comic/${id}`);

			await activate(page, landingPage.readLink(title));
			await expect(page).toHaveURL(new RegExp(`/comic/${id}/view$`));

			await new LandingPage(page).goto();
			await activate(page, landingPage.editLink(title));
			await expect(page).toHaveURL(new RegExp(`/comic/${id}$`));
		},
	);

	test(
		'example comics show their bundled cover, and Read and Edit lead to them',
		{ tag: '@REQ-235-1' },
		async ({ page }) => {
			const landingPage = await new LandingPage(page).goto();

			for (const example of [EXAMPLE, exampleMinimal()]) {
				expect(example.cover).toBeDefined();
				await expect(landingPage.card(example.title).locator('img')).toHaveAttribute(
					'src',
					example.cover?.portrait?.src ?? '',
				);
				await expect(landingPage.readLink(example.title)).toHaveAttribute(
					'href',
					`/comic/${example.id}/view`,
				);
				await expect(landingPage.editLink(example.title)).toHaveAttribute(
					'href',
					`/comic/${example.id}`,
				);
			}
		},
	);

	test(
		'a comic without a cover shows a 3:4 "No cover yet" box',
		{ tag: '@REQ-235-2' },
		async ({ page }) => {
			const example = exampleNoImages();
			expect(example.cover).toBeUndefined();
			const landingPage = await new LandingPage(page).goto();

			const card = landingPage.card(example.title);
			await expect(card.getByText(LANDING_COPY.noCoverYet)).toBeVisible();
			await expect(card.locator('img')).toHaveCount(0);
			await expectPortraitBox(card.getByText(LANDING_COPY.noCoverYet));
		},
	);

	test(
		'a created comic whose cover is deleted shows "No cover yet"',
		{ tag: '@REQ-235-2' },
		async ({ page }) => {
			const { id, title } = await createdComicWithCover(page);
			await deleteCover(page);
			await expect(page.getByRole('button', { name: m.addCover() })).toBeVisible();
			expect((await storedComic(page, id)).cover).toBeUndefined();

			const landingPage = await new LandingPage(page).goto();

			await expect(landingPage.card(title).getByText(LANDING_COPY.noCoverYet)).toBeVisible();
			await expect(landingPage.card(title).locator('img')).toHaveCount(0);
		},
	);

	test(
		'a cover whose file is gone shows the placeholder',
		{ tag: ['@REQ-036', '@REQ-235-1'] },
		async ({ page }) => {
			const { title, coverFile } = await createdComicWithCover(page);
			await page.evaluate(async (name) => {
				const root = await navigator.storage.getDirectory();
				await root.removeEntry(name);
			}, coverFile);

			const landingPage = await new LandingPage(page).goto();

			await expect(landingPage.card(title).locator('img')).toHaveAttribute('src', MISSING_IMAGE);
		},
	);

	test(
		'deletes a comic with the keyboard through an icon-only button outside the links',
		{ tag: ['@REQ-002', '@REQ-235-1'] },
		async ({ page }) => {
			const landingPage = await new LandingPage(page).goto();
			const card = landingPage.card(EXAMPLE.title);
			await expect(card.locator('img')).toBeVisible();
			await expect(card.getByRole('link').getByRole('button')).toHaveCount(0);
			// Icon-only: the name comes from aria-label and the button has no visible text.
			const button = landingPage.deleteComicButton(EXAMPLE.title);
			await expect(button).toHaveAttribute('aria-label', m.deleteComic({ title: EXAMPLE.title }));
			await expect(button).toHaveText('');

			await tabTo(page, button);
			await activate(page, button);

			await expect(card).toBeHidden();
		},
	);

	test.describe('layout', { tag: '@REQ-235-3' }, () => {
		/** Cards of the library, tile included, as their top-left corners. */
		async function positions(page: Page) {
			await new LandingPage(page).goto();
			await expect(new LandingPage(page).cards).toHaveCount(4);
			await expect(new LandingPage(page).cards.locator('img').first()).toBeVisible();
			return new LandingPage(page).cards.evaluateAll((items) =>
				items.map((item) => {
					const { x, y } = item.getBoundingClientRect();
					return { x: Math.round(x), y: Math.round(y) };
				}),
			);
		}

		test.describe('at 320 px', { tag: '@REQ-040' }, () => {
			test.use({ viewport: { width: 320, height: 640 } });

			test('stacks one card per row without horizontal scroll', async ({ page }) => {
				const boxes = await positions(page);

				expect(new Set(boxes.map((box) => box.x)).size).toBe(1);
				expect(new Set(boxes.map((box) => box.y)).size).toBe(boxes.length);
				const { scrollWidth, clientWidth } = await page.evaluate(() => ({
					scrollWidth: document.documentElement.scrollWidth,
					clientWidth: document.documentElement.clientWidth,
				}));
				expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
			});
		});

		test.describe('at 1280 px', () => {
			test.use({ viewport: { width: 1280, height: 800 } });

			test('puts several cards in a row, none narrower than 220 px', async ({ page }) => {
				const boxes = await positions(page);

				expect(new Set(boxes.map((box) => box.x)).size).toBeGreaterThan(1);
				const widths = await new LandingPage(page).cards.evaluateAll((items) =>
					items.map((item) => item.getBoundingClientRect().width),
				);
				for (const width of widths) {
					expect(width).toBeGreaterThanOrEqual(220);
				}
			});
		});

		test('loads the first four covers eagerly and later ones lazily', async ({ page }) => {
			// Without the cover-less example every card has a cover, so card position and
			// cover position agree.
			const landingPage = await new LandingPage(page).goto();
			await activate(page, landingPage.deleteComicButton(exampleNoImages().title));
			await expect(landingPage.card(exampleNoImages().title)).toBeHidden();
			for (let created = 0; created < 4; created++) {
				await createComic(page);
			}
			await gotoHydrated(page, '/');

			const covers = landingPage.cards.locator('img');
			await expect(covers).toHaveCount(6);
			const loading = await covers.evaluateAll((images) =>
				images.map((image) => image.getAttribute('loading')),
			);
			expect(loading.slice(0, 4)).not.toContain('lazy');
			expect(loading.slice(4)).toEqual(['lazy', 'lazy']);
		});
	});
});

/** The text sits in a 3:4 box: it, or an ancestor inside the card, is 3 wide for 4 tall. */
async function expectPortraitBox(text: Locator) {
	const ratios = await text.evaluate((element) => {
		const found: number[] = [];
		for (
			let node: Element | null = element;
			node && node.tagName !== 'LI';
			node = node.parentElement
		) {
			const { width, height } = node.getBoundingClientRect();
			found.push(width / height);
		}
		return found;
	});
	expect(ratios.some((ratio) => Math.abs(ratio - 3 / 4) < 0.02)).toBe(true);
}
