import { m } from '$lib/paraglide/messages';
import type { Comic } from '$lib/types';
import { expect, test, type Page } from '@playwright/test';
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

/** The line a reader sees for one dialogue entry. */
function dialogueLine(comic: Comic, panelIndex: number, lineIndex: number): string {
	const line = comic.panels[panelIndex].dialogue[lineIndex];
	const name = comic.characters.find(({ id }) => id === line.characterId)?.name;
	return name ? `${name}: ${line.text}` : line.text;
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
			const cover = page.locator('main > img');
			await expect(cover).toHaveCount(1);
			await expect(cover).toHaveAttribute('alt', String(comic.cover?.alt));

			await expect(view.panelHeadings).toHaveCount(comic.panels.length);
			for (const [index, panel] of comic.panels.entries()) {
				await expect(view.panelHeadings.nth(index)).toHaveText(m.panel({ number: index + 1 }));
				for (const caption of panel.captions) {
					await expect(page.getByText(caption, { exact: true })).toBeVisible();
				}
				for (const lineIndex of panel.dialogue.keys()) {
					await expect(
						page.getByText(dialogueLine(comic, index, lineIndex), { exact: true }),
					).toBeVisible();
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
			await expect(view.panelHeading(2)).toBeVisible();
			for (const caption of second.captions) {
				await expect(page.getByText(caption, { exact: true })).toBeVisible();
			}
			for (const lineIndex of second.dialogue.keys()) {
				await expect(
					page.getByText(dialogueLine(comic, 1, lineIndex), { exact: true }),
				).toBeVisible();
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
			const coverSrc = comic.cover?.landscape.src;
			const panelSrc = comic.panels[0].image?.landscape.src;
			expect(coverSrc).toBeTruthy();
			expect(panelSrc).toBeTruthy();
			await removeStoredFile(page, String(coverSrc));
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
