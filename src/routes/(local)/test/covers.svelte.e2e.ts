import { m } from '#lib/paraglide/messages.js';
import { primaryVariant } from '#lib/types/image-variants.ts';
import { expect, test, type Page } from '@playwright/test';
import { createComic, storedComic } from '../../../tests/e2e/createdComic';
import {
	EXAMPLE_COMPLETE as EXAMPLE,
	exampleMinimal,
	exampleNoImages,
} from '../../../tests/e2e/examples';
import { deleteCover } from '../../../tests/e2e/cover';
import { gotoHydrated } from '../../../tests/e2e/gotoHydrated';
import { activate, tabTo } from '../../../tests/e2e/keyboard';
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
		'a created comic shows its cover inside the link, named by the title',
		{ tag: '@REQ-235-1' },
		async ({ page }) => {
			const { title } = await createdComicWithCover(page);
			const landingPage = await new LandingPage(page).goto();

			const link = landingPage.comicLink(title);
			await expect(link).toBeVisible();
			await expect(link.locator('img')).toHaveCount(1);
			await expect(link.locator('img')).toHaveAttribute('alt', '');
			await expect(link.locator('img')).not.toHaveAttribute('src', MISSING_IMAGE);
			await expect(link.locator('img')).toBeVisible();
		},
	);

	test(
		'opens the comic page from the link with the keyboard',
		{ tag: ['@REQ-235-1', '@REQ-001'] },
		async ({ page }) => {
			const { id, title } = await createdComicWithCover(page);
			const landingPage = await new LandingPage(page).goto();

			await activate(page, landingPage.comicLink(title));

			await expect(page).toHaveURL(new RegExp(`/comic/${id}$`));
		},
	);

	test(
		'example comics show their bundled cover inside the link',
		{ tag: '@REQ-235-1' },
		async ({ page }) => {
			const landingPage = await new LandingPage(page).goto();

			for (const example of [EXAMPLE, exampleMinimal()]) {
				expect(example.cover).toBeDefined();
				await expect(landingPage.comicLink(example.title).locator('img')).toHaveAttribute(
					'src',
					example.cover?.portrait?.src ?? '',
				);
			}
		},
	);

	test('a comic without a cover shows only its title', { tag: '@REQ-235-2' }, async ({ page }) => {
		const example = exampleNoImages();
		expect(example.cover).toBeUndefined();
		const landingPage = await new LandingPage(page).goto();

		await expect(landingPage.comicLink(example.title)).toBeVisible();
		await expect(landingPage.comicLink(example.title).locator('img')).toHaveCount(0);
	});

	test(
		'a created comic whose cover is deleted shows only its title',
		{ tag: '@REQ-235-2' },
		async ({ page }) => {
			const { id, title } = await createdComicWithCover(page);
			await deleteCover(page);
			await expect(page.getByRole('button', { name: m.addCover() })).toBeVisible();
			expect((await storedComic(page, id)).cover).toBeUndefined();

			const landingPage = await new LandingPage(page).goto();

			await expect(landingPage.comicLink(title)).toBeVisible();
			await expect(landingPage.comicLink(title).locator('img')).toHaveCount(0);
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

			await expect(landingPage.comicLink(title).locator('img')).toHaveAttribute(
				'src',
				MISSING_IMAGE,
			);
		},
	);

	test(
		'deletes a comic with the keyboard; the button is not inside the link',
		{ tag: ['@REQ-002', '@REQ-235-1'] },
		async ({ page }) => {
			const landingPage = await new LandingPage(page).goto();
			await expect(landingPage.comicLink(EXAMPLE.title).locator('img')).toBeVisible();
			await expect(landingPage.comicLink(EXAMPLE.title).getByRole('button')).toHaveCount(0);

			await tabTo(page, landingPage.deleteComicButton(EXAMPLE.title));
			await activate(page, landingPage.deleteComicButton(EXAMPLE.title));

			await expect(landingPage.comicLink(EXAMPLE.title)).toBeHidden();
		},
	);

	test.describe('layout', { tag: '@REQ-235-3' }, () => {
		const entries = (page: Page) => page.locator('ul[aria-labelledby="comics"] > li');

		async function positions(page: Page) {
			await new LandingPage(page).goto();
			await expect(entries(page)).toHaveCount(3);
			await expect(entries(page).locator('img').first()).toBeVisible();
			const boxes = await entries(page).evaluateAll((items) =>
				items.map((item) => {
					const { x, y } = item.getBoundingClientRect();
					return { x: Math.round(x), y: Math.round(y) };
				}),
			);
			return boxes;
		}

		test.describe('at 320 px', { tag: '@REQ-040' }, () => {
			test.use({ viewport: { width: 320, height: 640 } });

			test('stacks one entry per row without horizontal scroll', async ({ page }) => {
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

		test.describe('from the 48em breakpoint', () => {
			test.use({ viewport: { width: 1024, height: 768 } });

			test('puts three entries in a row', async ({ page }) => {
				const boxes = await positions(page);

				expect(new Set(boxes.map((box) => box.y)).size).toBe(1);
				expect(new Set(boxes.map((box) => box.x)).size).toBe(3);
			});

			test(
				'keeps a comic without a cover as tall as its row neighbours',
				{ tag: '@REQ-235-2' },
				async ({ page }) => {
					await new LandingPage(page).goto();
					await expect(entries(page)).toHaveCount(3);
					await expect(entries(page).filter({ hasNot: page.locator('img') })).toHaveCount(1);

					const heights = await entries(page).evaluateAll((items) =>
						items.map((item) =>
							Math.round(item.querySelector('a')?.getBoundingClientRect().height ?? 0),
						),
					);
					expect(new Set(heights).size).toBe(1);
				},
			);
		});

		test('loads the first three covers eagerly and later ones lazily', async ({ page }) => {
			// Without the cover-less example every entry has a cover, so row position and
			// cover position agree.
			const landingPage = await new LandingPage(page).goto();
			await activate(page, landingPage.deleteComicButton(exampleNoImages().title));
			await expect(landingPage.comicLink(exampleNoImages().title)).toBeHidden();
			for (let created = 0; created < 3; created++) {
				await createComic(page);
			}
			await gotoHydrated(page, '/');

			const covers = entries(page).locator('img');
			await expect(covers).toHaveCount(5);
			const loading = await covers.evaluateAll((images) =>
				images.map((image) => image.getAttribute('loading')),
			);
			expect(loading.slice(0, 3)).not.toContain('lazy');
			expect(loading.slice(3)).toEqual(['lazy', 'lazy']);
		});
	});
});
