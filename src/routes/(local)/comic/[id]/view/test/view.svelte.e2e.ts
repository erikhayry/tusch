import { m } from '#lib/paraglide/messages.js';
import type { Comic } from '#lib/types/index.ts';
import { expect, test, type Locator, type Page } from '@playwright/test';
import {
	createComic,
	deletePanel,
	generatePanelImage,
	storedComic,
} from '../../../../../../tests/e2e/createdComic';
import { exampleNoImages } from '../../../../../../tests/e2e/examples';
import { gotoHydrated } from '../../../../../../tests/e2e/gotoHydrated';
import { activate } from '../../../../../../tests/e2e/keyboard';
import { ViewPage } from './utils/viewPage';

const MISSING_ID = '00000000-0000-4000-8000-000000000000';
const EMPTY_TITLE_URL = 'https://example.com/article/mock-error:empty-title';

/** The text of one dialogue entry; the speaker's name is a separate bold label in the box. */
function dialogueText(comic: Comic, panelIndex: number, lineIndex: number): string {
	return comic.panels[panelIndex].dialogue[lineIndex].text;
}

/** The name of the character who speaks a dialogue entry, if known. */
function speakerName(comic: Comic, panelIndex: number, lineIndex: number): string | undefined {
	const { characterId } = comic.panels[panelIndex].dialogue[lineIndex];
	return comic.characters.find(({ id }) => id === characterId)?.name;
}

/** Edit a stored panel, as a user's comic can have any mix of captions and dialogue. */
async function editStoredPanel(
	page: Page,
	comicId: string,
	panelIndex: number,
	patch: Partial<Pick<Comic['panels'][number], 'captions' | 'dialogue'>>,
) {
	await page.evaluate(
		({ id, index, changes }) => {
			const db = JSON.parse(localStorage.getItem('comics_db') ?? '{"comics":[]}');
			const comic = db.comics.find((c: { id: string }) => c.id === id);
			Object.assign(comic.panels[index], changes);
			localStorage.setItem('comics_db', JSON.stringify(db));
		},
		{ id: comicId, index: panelIndex, changes: patch },
	);
}

type Box = { x: number; y: number; width: number; height: number };

async function boxOf(locator: Locator): Promise<Box> {
	await expect(locator).toBeVisible();
	const box = await locator.boundingBox();
	if (!box) {
		throw new Error('element has no bounding box');
	}
	return box;
}

/** `inner` lies inside `outer`, give or take a rounding pixel. */
function expectInside(inner: Box, outer: Box) {
	expect(inner.x).toBeGreaterThanOrEqual(outer.x - 1);
	expect(inner.y).toBeGreaterThanOrEqual(outer.y - 1);
	expect(inner.x + inner.width).toBeLessThanOrEqual(outer.x + outer.width + 1);
	expect(inner.y + inner.height).toBeLessThanOrEqual(outer.y + outer.height + 1);
}

/**
 * A comic made through the UI with a cover and a generated image on panel 1:
 * what a real user has, not a bundled example.
 */
async function createViewableComic(page: Page): Promise<Comic> {
	const id = await createComic(page);
	if (!(await storedComic(page, id)).cover) {
		await activate(page, page.getByRole('button', { name: m.addCover() }));
		await expect.poll(async () => (await storedComic(page, id)).cover).toBeDefined();
	}
	const comic = await storedComic(page, id);
	await generatePanelImage(page, id, comic.panels[0].id);
	return storedComic(page, id);
}

/** Remove a stored image file, as if the browser had cleared OPFS. */
async function removeStoredFile(page: Page, name: string) {
	await page.evaluate(async (fileName) => {
		const root = await navigator.storage.getDirectory();
		await root.removeEntry(fileName);
	}, name);
}

test.describe('comic page link', () => {
	test(
		'View comic opens the viewer and Back returns to the comic page',
		{ tag: '@REQ-87-1' },
		async ({ page }) => {
			const comic = await createViewableComic(page);
			await gotoHydrated(page, `/comic/${comic.id}`);

			await activate(page, page.getByRole('link', { name: m.viewComic(), exact: true }));
			await expect(page).toHaveURL(`/comic/${comic.id}/view`);

			await activate(page, new ViewPage(page, comic.id).backLink);
			await expect(page).toHaveURL(`/comic/${comic.id}`);
		},
	);

	test(
		'View comic is a link between the h1 and the Settings heading and adds no heading',
		{ tag: ['@REQ-87-1', '@REQ-236-1', '@REQ-236-2'] },
		async ({ page }) => {
			const comic = await createViewableComic(page);
			await gotoHydrated(page, `/comic/${comic.id}`);

			await expect(page.getByRole('button', { name: m.viewComic() })).toHaveCount(0);
			const link = page.getByRole('link', { name: m.viewComic(), exact: true });
			await expect(link).toHaveAttribute('href', `/comic/${comic.id}/view`);

			const h1 = page.getByRole('heading', { level: 1 });
			const settings = page.getByRole('heading', { name: m.settings(), level: 2, exact: true });
			await expect(h1).toHaveCount(1);
			const y = async (locator: typeof link) => (await locator.boundingBox())?.y ?? Number.NaN;
			expect(await y(h1)).toBeLessThan(await y(link));
			expect(await y(link)).toBeLessThan(await y(settings));

			// Same outline as before: h1, then "Settings" at level 2, nothing skipped.
			await expect(page.getByRole('heading', { name: m.viewComic() })).toHaveCount(0);
			await expect(page.getByRole('heading', { level: 2 }).first()).toHaveText(m.settings());
		},
	);
});

test.describe('viewer content', () => {
	test(
		'shows the title, the cover and every panel in order',
		{ tag: ['@REQ-87-2', '@REQ-010', '@REQ-023'] },
		async ({ page }) => {
			const comic = await createViewableComic(page);
			const view = await new ViewPage(page, comic.id).goto();

			await expect(view.title).toHaveCount(1);
			await expect(view.title).toHaveText(comic.title);
			// The cover is the image outside the panel sections (it shares its alt text with panel 1 in the mock).
			const cover = page.locator('main > .cover img');
			await expect(cover).toHaveCount(1);
			await expect(cover).toHaveAttribute('alt', String(comic.cover?.alt));

			await expect(view.panelHeadings).toHaveCount(comic.panels.length);
			for (const [index, panel] of comic.panels.entries()) {
				await expect(view.panelHeadings.nth(index)).toHaveText(m.panel({ number: index + 1 }));
				for (const caption of panel.captions) {
					await expect(page.getByText(caption, { exact: true })).toBeVisible();
				}
				for (const lineIndex of panel.dialogue.keys()) {
					await expect(page.getByText(dialogueText(comic, index, lineIndex))).toBeVisible();
				}
			}
			// Panel 1 has a generated image. Scoped to its section: the cover has the same mock alt text.
			await expect(
				page.locator('section', { has: view.panelHeading(1) }).getByRole('img'),
			).toBeVisible();
		},
	);

	test(
		'an empty title reads "Untitled comic"',
		{ tag: ['@REQ-236-3', '@REQ-87-2'] },
		async ({ page }) => {
			const id = await createComic(page, EMPTY_TITLE_URL);
			expect((await storedComic(page, id)).title).toBe('');

			const view = await new ViewPage(page, id).goto();

			await expect(view.title).toHaveText(m.untitledComic());
			await expect(page).toHaveTitle(`${m.untitledComic()} · Tusch`);
		},
	);

	test('has no form, button or editing data', { tag: ['@REQ-87-3'] }, async ({ page }) => {
		const comic = await createViewableComic(page);
		const view = await new ViewPage(page, comic.id).goto();
		await expect(view.title).toBeVisible();

		await expect(page.locator('form')).toHaveCount(0);
		await expect(page.getByRole('button')).toHaveCount(0);

		// Only the cover and panel 1's image: no dialogue head crops.
		await expect(view.images).toHaveCount(2);

		for (const text of [m.settings(), m.source(), m.comicStyle(), m.panels()]) {
			await expect(page.getByRole('heading', { name: text, exact: true })).toHaveCount(0);
		}
		const main = page.getByRole('main');
		for (const panel of comic.panels) {
			await expect(main).not.toContainText(panel.visualDescription);
			// `place` is not checked: the mock's captions name the same place, so it is reader text.
		}
		for (const character of comic.characters) {
			await expect(main).not.toContainText(character.description.masterVisualPrompt);
		}
		if (comic.story) {
			await expect(main).not.toContainText(comic.story);
		}
		if (comic.source) {
			await expect(main).not.toContainText(comic.source);
		}
	});
});

test.describe('viewer boxes', () => {
	test(
		'panel headings are in the accessibility tree but not visible',
		{ tag: '@REQ-87-2' },
		async ({ page }) => {
			const comic = await createViewableComic(page);
			const view = await new ViewPage(page, comic.id).goto();

			await expect(view.panelHeadings).toHaveCount(comic.panels.length);
			for (const number of [1, 2]) {
				const heading = view.panelHeading(number);
				await expect(heading).toBeAttached();
				const box = await heading.boundingBox();
				// Visually hidden text collapses to at most a pixel.
				expect(box === null || (box.width <= 1 && box.height <= 1)).toBe(true);
			}
		},
	);

	test(
		'the cover is full width with the title as an inverted caption on it',
		{ tag: '@REQ-283-5' },
		async ({ page }) => {
			const comic = await createViewableComic(page);
			const view = await new ViewPage(page, comic.id).goto();

			const main = await boxOf(page.getByRole('main'));
			const cover = await boxOf(page.locator('main > .cover img'));
			expect(cover.width).toBeGreaterThanOrEqual(main.width * 0.9);
			const title = await boxOf(view.title);
			expectInside(title, cover);
			expect(title.y + title.height).toBeLessThanOrEqual(cover.y + cover.height / 2 + 1);
			expect(title.x + title.width).toBeLessThanOrEqual(cover.x + cover.width / 2 + 1);

			const first = await boxOf(view.panelImage(1));
			expect(first.y).toBeGreaterThan(cover.y + cover.height);

			// Inverted: the title's text colour is a caption box's background, and vice versa.
			const colours = (locator: Locator) =>
				locator.evaluate((element) => {
					const { color, backgroundColor } = getComputedStyle(element);
					return { color, backgroundColor };
				});
			const caption = await colours(page.getByText(comic.panels[0].captions[0], { exact: true }));
			const heading = await colours(view.title);
			expect(heading.color).toBe(caption.backgroundColor);
			expect(heading.backgroundColor).toBe(caption.color);
		},
	);

	test(
		'a comic without a cover shows the title as the same box',
		{ tag: '@REQ-283-5' },
		async ({ page }) => {
			const id = await createComic(page);
			// A comic whose cover was never made: drop it from the stored comic.
			await page.evaluate((comicId) => {
				const db = JSON.parse(localStorage.getItem('comics_db') ?? '{"comics":[]}');
				delete db.comics.find((c: { id: string }) => c.id === comicId).cover;
				localStorage.setItem('comics_db', JSON.stringify(db));
			}, id);
			const view = await new ViewPage(page, id).goto();

			await expect(page.locator('main img')).toHaveCount(0);
			await expect(view.title).toBeVisible();
		},
	);

	test(
		'a panel image fills the width and nearly the height, so the next panel shows below',
		{ tag: '@REQ-283-4' },
		async ({ page }) => {
			const comic = await createViewableComic(page);
			const view = await new ViewPage(page, comic.id).goto();

			const viewport = page.viewportSize();
			const image = await boxOf(view.panelImage(1));
			const main = await boxOf(page.getByRole('main'));
			expect(viewport).not.toBeNull();
			const height = viewport?.height ?? 0;
			expect(image.width).toBeGreaterThanOrEqual(main.width * 0.9);
			expect(image.height).toBeGreaterThan(height * 0.8);
			expect(image.height).toBeLessThan(height);

			const next = await boxOf(view.panelSection(2));
			expect(next.y).toBeGreaterThan(image.y + image.height);
		},
	);

	test(
		'a caption box lies in the top-left of the image when the panel has no dialogue',
		{ tag: '@REQ-283-1' },
		async ({ page }) => {
			const comic = await createViewableComic(page);
			await editStoredPanel(page, comic.id, 0, { dialogue: [] });
			const view = await new ViewPage(page, comic.id).goto();

			const image = await boxOf(view.panelImage(1));
			const caption = await boxOf(page.getByText(comic.panels[0].captions[0], { exact: true }));
			expectInside(caption, image);
			expect(caption.y + caption.height).toBeLessThanOrEqual(image.y + image.height / 2 + 1);
			expect(caption.x + caption.width).toBeLessThanOrEqual(image.x + image.width / 2 + 1);
		},
	);

	test(
		'speech boxes lie in the bottom half of the image when the panel has no captions',
		{ tag: '@REQ-283-1' },
		async ({ page }) => {
			const comic = await createViewableComic(page);
			await editStoredPanel(page, comic.id, 0, { captions: [] });
			const view = await new ViewPage(page, comic.id).goto();

			const image = await boxOf(view.panelImage(1));
			for (const lineIndex of comic.panels[0].dialogue.keys()) {
				const box = await boxOf(page.getByText(dialogueText(comic, 0, lineIndex)));
				expectInside(box, image);
				expect(box.y + 1).toBeGreaterThanOrEqual(image.y + image.height / 2);
			}
		},
	);

	test(
		'with a caption and dialogue the caption is above every speech box, all inside the image',
		{ tag: '@REQ-283-1' },
		async ({ page }) => {
			const comic = await createViewableComic(page);
			const [panel] = comic.panels;
			expect(panel.captions.length).toBeGreaterThan(0);
			expect(panel.dialogue.length).toBeGreaterThan(0);
			const view = await new ViewPage(page, comic.id).goto();

			const image = await boxOf(view.panelImage(1));
			const captions = [];
			for (const caption of panel.captions) {
				captions.push(await boxOf(page.getByText(caption, { exact: true })));
			}
			for (const lineIndex of panel.dialogue.keys()) {
				const speech = await boxOf(page.getByText(dialogueText(comic, 0, lineIndex)));
				expectInside(speech, image);
				for (const caption of captions) {
					expectInside(caption, image);
					expect(caption.y + caption.height).toBeLessThanOrEqual(speech.y + 1);
				}
			}
		},
	);

	test(
		'a panel without an image lists captions before dialogue and renders no image',
		{ tag: ['@REQ-283-2', '@REQ-87-4'] },
		async ({ page }) => {
			const comic = await createViewableComic(page);
			const [, panel] = comic.panels;
			expect(panel.image).toBeUndefined();
			const view = await new ViewPage(page, comic.id).goto();

			const section = view.panelSection(2);
			await expect(section.getByRole('img')).toHaveCount(0);
			const lastCaption = await boxOf(
				section.getByText(panel.captions[panel.captions.length - 1], { exact: true }),
			);
			const firstSpeech = await boxOf(section.getByText(dialogueText(comic, 1, 0)));
			expect(lastCaption.y + lastCaption.height).toBeLessThanOrEqual(firstSpeech.y + 1);
			// DOM order: every caption precedes every dialogue line.
			const texts = await section.evaluate((el) => el.textContent ?? '');
			expect(texts.indexOf(panel.captions[panel.captions.length - 1])).toBeLessThan(
				texts.indexOf(dialogueText(comic, 1, 0)),
			);
		},
	);

	test(
		'a speech box shows the speaker in bold before the text; an unknown speaker shows the text alone',
		{ tag: ['@REQ-283-3', '@REQ-87-2'] },
		async ({ page }) => {
			const comic = await createViewableComic(page);
			const name = speakerName(comic, 0, 0);
			expect(name).toBeTruthy();
			const unknownText = 'Said by someone no longer in the cast';
			await editStoredPanel(page, comic.id, 0, {
				dialogue: [
					...comic.panels[0].dialogue,
					{ characterId: '00000000-0000-4000-8000-000000000001', text: unknownText },
				],
			});
			const view = await new ViewPage(page, comic.id).goto();
			const section = view.panelSection(1);

			const known = section.getByText(dialogueText(comic, 0, 0));
			const label = known.locator('strong, b').first();
			await expect(label).toHaveText(String(name));
			const content = ((await known.textContent()) ?? '').trim();
			expect(content.startsWith(String(name))).toBe(true);
			expect(content.endsWith(dialogueText(comic, 0, 0))).toBe(true);

			const unknown = section.getByText(unknownText);
			await expect(unknown).toBeVisible();
			await expect(unknown.locator('strong, b')).toHaveCount(0);
			// No head crops: only the cover and panel 1's image.
			await expect(view.images).toHaveCount(2);
		},
	);
});

test.describe('viewer without images or panels', () => {
	test(
		'a panel without an image still shows its heading, captions and dialogue',
		{ tag: '@REQ-87-4' },
		async ({ page }) => {
			const comic = await createViewableComic(page);
			const view = await new ViewPage(page, comic.id).goto();
			const [first, second] = comic.panels;

			// Panel 2 was never given an image.
			expect(second.image).toBeUndefined();
			await expect(view.panelHeading(2)).toBeAttached();
			for (const caption of second.captions) {
				await expect(page.getByText(caption, { exact: true })).toBeVisible();
			}
			for (const lineIndex of second.dialogue.keys()) {
				await expect(page.getByText(dialogueText(comic, 1, lineIndex))).toBeVisible();
			}
			// Cover plus panel 1 only.
			expect(first.image).toBeDefined();
			await expect(view.images).toHaveCount(2);
		},
	);

	test(
		'the no-images example shows its panels without images',
		{ tag: '@REQ-87-4' },
		async ({ page }) => {
			const example = exampleNoImages();
			const view = await new ViewPage(page, example.id).goto();

			await expect(view.panelHeadings).toHaveCount(example.panels.length);
			await expect(view.images).toHaveCount(0);
			for (const caption of example.panels[0].captions) {
				await expect(page.getByText(caption, { exact: true })).toBeVisible();
			}
		},
	);

	test(
		'a comic whose panels are all deleted shows only the title and the cover',
		{ tag: '@REQ-87-4' },
		async ({ page }) => {
			const comic = await createViewableComic(page);
			for (let number = comic.panels.length; number >= 1; number--) {
				await deletePanel(page, comic.id, number);
			}
			expect((await storedComic(page, comic.id)).panels).toEqual([]);

			const view = await new ViewPage(page, comic.id).goto();

			await expect(view.title).toHaveText(comic.title);
			await expect(page.getByRole('img', { name: comic.cover?.alt, exact: true })).toBeVisible();
			await expect(view.panelHeadings).toHaveCount(0);
			await expect(view.images).toHaveCount(1);
		},
	);
});

test.describe('viewer edge cases', () => {
	test(
		'a cover and a panel image whose files are missing show the placeholder',
		{ tag: '@REQ-036' },
		async ({ page }) => {
			const comic = await createViewableComic(page);
			// A cover has two variants (REQ-280-2): both files are missing, so the cover shows the placeholder.
			const coverSrcs = [comic.cover?.landscape?.src, comic.cover?.portrait?.src];
			const panelSrc = comic.panels[0].image?.portrait?.src;
			expect(coverSrcs.every(Boolean)).toBe(true);
			expect(panelSrc).toBeTruthy();
			for (const coverSrc of coverSrcs) {
				await removeStoredFile(page, String(coverSrc));
			}
			await removeStoredFile(page, String(panelSrc));

			const view = await new ViewPage(page, comic.id).goto();

			await expect(view.images).toHaveCount(2);
			for (const image of await view.images.all()) {
				await expect(image).toHaveAttribute('src', '/missing-image.svg');
			}
		},
	);

	test('a missing comic shows not found', { tag: '@REQ-024' }, async ({ page }) => {
		await gotoHydrated(page, `/comic/${MISSING_ID}/view`);

		await expect(page.getByRole('heading', { name: '404' })).toBeVisible();
		await expect(page.getByText('Comic not found')).toBeVisible();
	});
});
