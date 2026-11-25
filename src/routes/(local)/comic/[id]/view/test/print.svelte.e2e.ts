import { m } from '#lib/paraglide/messages.js';
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { luminance } from '../../../../../../tests/e2e/contrast';
import { deleteCover } from '../../../../../../tests/e2e/cover';
import { createComic, storedComic } from '../../../../../../tests/e2e/createdComic';
import { orientationsOf } from '../../../../../../tests/e2e/imageFormat';
import { LANDSCAPE_VIEWPORT } from './utils/downloadedComic';
import { pageColours } from './utils/pageColours';
import { placeholderFrames } from './utils/placeholderFrames';
import { A4_VIEWPORT, openPrinted, PRINT_TARGETS } from './utils/printedComic';
import { ViewPage } from './utils/viewPage';
import { createViewableComic } from './utils/viewableComic';

const countText = (count: number) => (count === 1 ? m.panelCountOne() : m.panelCount({ count }));

/** The cover: the box that holds the comic's only `<h1>`, the title (REQ-283-5). */
const coverOf = (page: Page) => page.getByRole('heading', { level: 1 }).locator('xpath=..');

const sectionOf = (page: Page, number: number) =>
	page.locator('section', {
		has: page.getByRole('heading', { name: m.panel({ number }), level: 2, exact: true }),
	});

const styleOf = (locator: ReturnType<typeof coverOf>, properties: string[]) =>
	locator.evaluate((element, names) => {
		const style = getComputedStyle(element);
		return Object.fromEntries(names.map((name) => [name, style.getPropertyValue(name)]));
	}, properties);

for (const target of PRINT_TARGETS) {
	test.describe(`printing the ${target}`, () => {
		test(
			'keeps the cover and every panel whole, and starts each panel on a new page',
			{ tag: ['@REQ-89-1'] },
			async ({ page, browser }) => {
				const comic = await createViewableComic(page);
				expect(comic.panels.length).toBeGreaterThanOrEqual(2);
				const printed = await openPrinted(target, { page, browser }, comic);

				expect(await styleOf(coverOf(printed), ['break-inside'])).toEqual({
					'break-inside': 'avoid',
				});
				for (let number = 1; number <= comic.panels.length; number++) {
					expect(
						await styleOf(sectionOf(printed, number), ['break-inside', 'break-before']),
					).toEqual({
						'break-inside': 'avoid',
						'break-before': 'page',
					});
				}
			},
		);

		test(
			'fits every panel on an A4 page with its captions and speech over the image',
			{ tag: ['@REQ-89-1', '@REQ-283-1'] },
			async ({ page, browser }) => {
				const comic = await createViewableComic(page);
				const printed = await openPrinted(target, { page, browser }, comic);

				const cover = await coverOf(printed).boundingBox();
				expect(cover?.height).toBeLessThanOrEqual(A4_VIEWPORT.height);
				for (let number = 1; number <= comic.panels.length; number++) {
					const section = await sectionOf(printed, number).boundingBox();
					expect(section?.height).toBeGreaterThan(0);
					expect(section?.height).toBeLessThanOrEqual(A4_VIEWPORT.height);
					expect(section?.width).toBeLessThanOrEqual(A4_VIEWPORT.width);
				}

				// Panel 1 has the generated image; panels made through the UI have captions and speech.
				const [panel] = comic.panels;
				const image = await sectionOf(printed, 1).getByRole('img').boundingBox();
				if (!image) {
					throw new Error('panel 1 has no printed image');
				}
				expect(image.height).toBeLessThanOrEqual(A4_VIEWPORT.height);
				expect(image.width).toBeLessThanOrEqual(A4_VIEWPORT.width);
				const texts = [...panel.captions, ...panel.dialogue.map((line) => line.text)];
				expect(texts.length).toBeGreaterThan(0);
				for (const text of texts) {
					const box = await sectionOf(printed, 1).getByText(text).boundingBox();
					expect(box?.x).toBeGreaterThanOrEqual(image.x - 1);
					expect(box?.y).toBeGreaterThanOrEqual(image.y - 1);
					expect((box?.x ?? Infinity) + (box?.width ?? 0)).toBeLessThanOrEqual(
						image.x + image.width + 1,
					);
					expect((box?.y ?? Infinity) + (box?.height ?? 0)).toBeLessThanOrEqual(
						image.y + image.height + 1,
					);
				}
			},
		);

		test(
			'is dark text on a white page that passes colour contrast',
			{ tag: ['@REQ-89-2'] },
			async ({ page, browser }) => {
				const comic = await createViewableComic(page);
				const printed = await openPrinted(target, { page, browser }, comic);

				const { background, text } = await pageColours(printed);
				expect(luminance(background)).toBeGreaterThan(0.9);
				expect(luminance(text)).toBeLessThan(0.1);
				const { violations } = await new AxeBuilder({ page: printed })
					.withRules(['color-contrast'])
					.analyze();
				expect(violations).toEqual([]);
			},
		);

		test(
			'shows the portrait image of a cover and panel with both variants on a landscape page',
			{ tag: ['@REQ-89-4', '@REQ-103-5', '@REQ-88-3'] },
			async ({ page, browser }) => {
				const comic = await createViewableComic(page);
				const printed = await openPrinted(target, { page, browser }, comic, LANDSCAPE_VIEWPORT);

				// The cover and panel 1 are the comic's only <picture>s.
				await expect(printed.locator('picture')).toHaveCount(2);
				expect(await orientationsOf(printed.locator('picture img'))).toEqual([
					'portrait',
					'portrait',
				]);
			},
		);
	});
}

test.describe('printing the viewer', () => {
	test(
		'draws the placeholders of a cover and panels without images as outlined frames',
		{ tag: ['@REQ-89-2', '@REQ-87-4'] },
		async ({ page, browser }) => {
			// A comic the user made, without a cover and without panel images.
			const id = await createComic(page);
			await deleteCover(page);
			// The delete is a client command: wait until it is stored before reading the comic.
			await expect.poll(async () => (await storedComic(page, id)).cover).toBeUndefined();
			const comic = await storedComic(page, id);
			expect(comic.panels.every((panel) => !panel.image)).toBe(true);
			const printed = await openPrinted('viewer', { page, browser }, comic);

			// Narrow enough to skip the small decorative marks, wide enough for every frame.
			const frames = await placeholderFrames(printed.getByRole('main'), A4_VIEWPORT.width / 2);
			expect(frames).toHaveLength(1 + comic.panels.length);
			for (const frame of frames) {
				expect(frame.background).toBe('rgba(0, 0, 0, 0)');
				expect(frame.borderStyle).not.toBe('none');
				expect(parseFloat(frame.borderWidth)).toBeGreaterThan(0);
			}
		},
	);

	test(
		'hides the header and the ending links but keeps The end and the panel count',
		{ tag: ['@REQ-89-3', '@REQ-299-2'] },
		async ({ page, browser }) => {
			const comic = await createViewableComic(page);
			const printed = await openPrinted('viewer', { page, browser }, comic);
			const view = new ViewPage(printed, comic.id);

			await expect(view.header).toBeHidden();
			await expect(view.endingBackLink).toBeHidden();
			await expect(view.allComicsLink).toBeHidden();
			await expect(
				view.main.getByRole('link', { name: m.downloadComic(), exact: true }),
			).toBeHidden();
			await expect(view.main.getByText(m.theEnd())).toBeVisible();
			await expect(
				view.main.getByText(countText(comic.panels.length), { exact: true }),
			).toBeVisible();
		},
	);
});
