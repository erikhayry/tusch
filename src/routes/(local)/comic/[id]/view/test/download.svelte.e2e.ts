import { m } from '#lib/paraglide/messages.js';
import type { Comic } from '#lib/types/index.ts';
import { expect, test, type Page } from '@playwright/test';
import {
	createComic,
	generatePanelImage,
	storedComic,
} from '../../../../../../tests/e2e/createdComic';
import { luminance } from '../../../../../../tests/e2e/contrast';
import { EXAMPLE_COMPLETE } from '../../../../../../tests/e2e/examples';
import {
	createComicWithFormat,
	orientationOf,
	type ImageFormat,
} from '../../../../../../tests/e2e/imageFormat';
import {
	downloadComic,
	downloadLink,
	LANDSCAPE_VIEWPORT,
	loadedImageCount,
	openOffline,
	PORTRAIT_VIEWPORT,
} from './utils/downloadedComic';
import { pageColours } from './utils/pageColours';
import { ViewPage } from './utils/viewPage';
import { createViewableComic, removeStoredFile } from './utils/viewableComic';

const EMPTY_TITLE_URL = 'https://example.com/article/mock-error:empty-title';
/** Characters that are not allowed in file names on common systems. */
const FORBIDDEN_IN_FILE_NAMES = /[\\/:*?"<>|]/;

async function setStoredTitle(page: Page, comicId: string, title: string) {
	await page.evaluate(
		({ id, value }) => {
			const db = JSON.parse(localStorage.getItem('comics_db') ?? '{"comics":[]}');
			db.comics.find((c: { id: string }) => c.id === id).title = value;
			localStorage.setItem('comics_db', JSON.stringify(db));
		},
		{ id: comicId, value: title },
	);
}

/** The section of the panel in a downloaded file, found through its heading. */
function panelSection(page: Page, number: number) {
	return page.locator('section', {
		has: page.getByRole('heading', { name: m.panel({ number }), level: 2, exact: true }),
	});
}

test(
	'the viewer has a Download comic link in its header and its ending block and still no button or form',
	{ tag: ['@REQ-88-1', '@REQ-87-3'] },
	async ({ page }) => {
		const comic = await createViewableComic(page);
		await new ViewPage(page, comic.id).goto();

		for (const place of ['header', 'ending'] as const) {
			const link = downloadLink(page, place);
			await expect(link).toHaveCount(1);
			await expect(link).toBeVisible();
			await expect(link).toHaveAttribute('download');
		}
		await expect(page.getByRole('button')).toHaveCount(0);
		await expect(page.locator('form')).toHaveCount(0);
	},
);

test(
	'the ending block saves the same file as the header link',
	{ tag: ['@REQ-88-1', '@REQ-299-2'] },
	async ({ page }) => {
		const comic = await createViewableComic(page);
		const view = await new ViewPage(page, comic.id).goto();

		const fromHeader = await downloadComic(view, 'header');
		const fromEnding = await downloadComic(view, 'ending');

		expect(fromEnding.fileName).toBe(fromHeader.fileName);
		expect(fromEnding.html).toBe(fromHeader.html);
	},
);

test(
	'the downloaded file renders dark when opened in the light scheme',
	{ tag: ['@REQ-044', '@REQ-88-2'] },
	async ({ page, browser }) => {
		const comic = await createViewableComic(page);
		const { html } = await downloadComic(await new ViewPage(page, comic.id).goto());

		for (const scheme of ['light', 'dark'] as const) {
			const offline = await openOffline(browser, html, LANDSCAPE_VIEWPORT, scheme);
			const { background, text, colorScheme } = await pageColours(offline);
			expect(colorScheme).toContain('dark');
			expect(luminance(background)).toBeLessThan(0.1);
			expect(luminance(text)).toBeGreaterThan(0.5);
			await offline.context().close();
		}
	},
);

test.describe('file name', () => {
	test('is the comic title plus .html', { tag: '@REQ-88-1' }, async ({ page }) => {
		const id = await createComic(page);
		await setStoredTitle(page, id, 'My comic');

		const { fileName } = await downloadComic(await new ViewPage(page, id).goto());

		expect(fileName).toBe('My comic.html');
	});

	test('is "Untitled comic.html" for an empty title', { tag: '@REQ-88-1' }, async ({ page }) => {
		const id = await createComic(page, EMPTY_TITLE_URL);
		expect((await storedComic(page, id)).title).toBe('');

		const { fileName } = await downloadComic(await new ViewPage(page, id).goto());

		expect(fileName).toBe(`${m.untitledComic()}.html`);
	});

	test(
		'replaces characters that are not allowed in file names',
		{ tag: '@REQ-88-1' },
		async ({ page }) => {
			const id = await createComic(page);
			await setStoredTitle(page, id, 'Who? A/B: "x" <y> |z|');

			const { fileName } = await downloadComic(await new ViewPage(page, id).goto());

			expect(fileName).toMatch(/\.html$/);
			expect(fileName.slice(0, -'.html'.length)).not.toMatch(FORBIDDEN_IN_FILE_NAMES);
			expect(fileName.length).toBeGreaterThan('.html'.length);
		},
	);
});

test.describe('downloaded file', () => {
	test(
		'shows the comic offline with every image embedded as a data URL',
		{ tag: ['@REQ-88-2', '@REQ-87-2', '@REQ-283-1'] },
		async ({ page, browser }) => {
			const comic = await createViewableComic(page);
			const { html } = await downloadComic(await new ViewPage(page, comic.id).goto());

			const offline = await openOffline(browser, html);

			await expect(offline.getByRole('heading', { level: 1 })).toHaveText(comic.title);
			await expect(offline.getByRole('heading', { level: 2 })).toHaveCount(comic.panels.length);
			for (const [index, panel] of comic.panels.entries()) {
				await expect(
					offline.getByRole('heading', {
						name: m.panel({ number: index + 1 }),
						level: 2,
						exact: true,
					}),
				).toBeAttached();
				for (const caption of panel.captions) {
					await expect(offline.getByText(caption, { exact: true })).toBeVisible();
				}
				for (const line of panel.dialogue) {
					await expect(offline.getByText(line.text)).toBeVisible();
				}
			}
			// The cover and panel 1's image.
			expect(await loadedImageCount(offline)).toBe(2);
			const sources = await offline
				.locator('img')
				.evaluateAll((images) => images.map((image) => (image as HTMLImageElement).currentSrc));
			expect(sources.every((src) => src.startsWith('data:'))).toBe(true);
			expect(html).not.toMatch(/blob:|https?:\/\//);
		},
	);

	test(
		'has no script, form, button, link or editing data',
		{ tag: ['@REQ-88-2', '@REQ-87-3'] },
		async ({ page, browser }) => {
			const comic = await createViewableComic(page);
			const { html } = await downloadComic(await new ViewPage(page, comic.id).goto());

			expect(html).not.toMatch(/<script/i);
			const offline = await openOffline(browser, html);
			for (const selector of [
				'script',
				'form',
				'button',
				'a[href]',
				'input',
				'select',
				'textarea',
			]) {
				await expect(offline.locator(selector)).toHaveCount(0);
			}
			// The CSS is inlined: the document links no stylesheet.
			await expect(offline.locator('link')).toHaveCount(0);

			const body = offline.locator('body');
			for (const text of [m.settings(), m.source(), m.comicStyle(), m.panels()]) {
				await expect(offline.getByRole('heading', { name: text, exact: true })).toHaveCount(0);
			}
			for (const panel of comic.panels) {
				await expect(body).not.toContainText(panel.visualDescription);
			}
			for (const character of comic.characters) {
				await expect(body).not.toContainText(character.description.masterVisualPrompt);
			}
			for (const text of [comic.story, comic.source]) {
				if (text) {
					await expect(body).not.toContainText(text);
				}
			}
		},
	);

	test(
		'embeds the bundled images of an example comic',
		{ tag: ['@REQ-88-2'] },
		async ({ page, browser }) => {
			const view = await new ViewPage(page, EXAMPLE_COMPLETE.id).goto();
			const viewerImages = await view.images.count();
			expect(viewerImages).toBeGreaterThan(0);

			const { html } = await downloadComic(view);

			const offline = await openOffline(browser, html);
			expect(await loadedImageCount(offline)).toBe(viewerImages);
			const sources = await offline
				.locator('img')
				.evaluateAll((images) => images.map((image) => (image as HTMLImageElement).currentSrc));
			expect(sources.every((src) => src.startsWith('data:'))).toBe(true);
		},
	);
});

test.describe('image variants in the downloaded file', () => {
	test(
		'a cover and panel with both variants show the one that fits the viewport',
		{ tag: ['@REQ-88-3', '@REQ-103-5'] },
		async ({ page, browser }) => {
			const comic = await createViewableComic(page);
			const { html } = await downloadComic(await new ViewPage(page, comic.id).goto());

			const offline = await openOffline(browser, html);
			// The cover and panel 1 are both <picture>s.
			await expect(offline.locator('picture')).toHaveCount(2);
			for (const { viewport, expected } of [
				{ viewport: LANDSCAPE_VIEWPORT, expected: 'landscape' },
				{ viewport: PORTRAIT_VIEWPORT, expected: 'portrait' },
			] as const) {
				await offline.setViewportSize(viewport);
				await loadedImageCount(offline);
				for (const image of await offline.locator('picture img').all()) {
					expect(await orientationOf(image)).toBe(expected);
				}
			}
		},
	);

	for (const format of ['portrait', 'landscape'] as const satisfies ImageFormat[]) {
		test(
			`a panel with only the ${format} variant shows it at every size`,
			{ tag: '@REQ-88-3' },
			async ({ page, browser }) => {
				const { comicId, panelId } = await createComicWithFormat(page, format);
				await generatePanelImage(page, comicId, panelId);
				const { html } = await downloadComic(await new ViewPage(page, comicId).goto());

				const offline = await openOffline(browser, html);
				for (const viewport of [LANDSCAPE_VIEWPORT, PORTRAIT_VIEWPORT]) {
					await offline.setViewportSize(viewport);
					await loadedImageCount(offline);
					expect(await orientationOf(panelSection(offline, 1).getByRole('img'))).toBe(format);
				}
			},
		);
	}
});

test(
	'a cover and panel whose image files are missing are exported without images',
	{ tag: ['@REQ-88-4', '@REQ-036', '@REQ-87-4'] },
	async ({ page, browser }) => {
		const comic: Comic = await createViewableComic(page);
		const sources = [
			comic.cover?.landscape?.src,
			comic.cover?.portrait?.src,
			comic.panels[0].image?.landscape?.src,
			comic.panels[0].image?.portrait?.src,
		].filter((src): src is string => Boolean(src));
		expect(sources.length).toBeGreaterThanOrEqual(3);
		for (const src of sources) {
			await removeStoredFile(page, src);
		}

		const { html } = await downloadComic(await new ViewPage(page, comic.id).goto());

		const offline = await openOffline(browser, html);
		await expect(offline.getByRole('heading', { level: 1 })).toHaveText(comic.title);
		await expect(offline.locator('img')).toHaveCount(0);
		await expect(offline.getByRole('heading', { level: 2 })).toHaveCount(comic.panels.length);
		for (const caption of comic.panels[0].captions) {
			await expect(offline.getByText(caption, { exact: true })).toBeVisible();
		}
		for (const line of comic.panels[0].dialogue) {
			await expect(offline.getByText(line.text)).toBeVisible();
		}
	},
);
