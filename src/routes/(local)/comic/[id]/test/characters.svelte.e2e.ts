import { m } from '$lib/paraglide/messages';
import { expect, test, type Locator, type Page } from '@playwright/test';
import { EXAMPLE_COMPLETE as EXAMPLE } from '../../../../../tests/e2e/examples';
import { gotoHydrated } from '../../../../../tests/e2e/gotoHydrated';
import { activate } from '../../../../../tests/e2e/keyboard';

const PANEL = EXAMPLE.panels[0];
const CHARACTER = EXAMPLE.characters[0];

// Head sizes of each character in the mock panel image (PANEL_IMAGE_DATA).
const HEAD_SIZES = [
	{ character: EXAMPLE.characters[0], width: 170, height: 200 },
	{ character: EXAMPLE.characters[1], width: 190, height: 220 },
];

/** Stored crops of every character taken from the panel, read from localStorage. */
function storedCropCounts(page: Page, panelId: string): Promise<number[]> {
	return page.evaluate(
		(id) => {
			const { comics } = JSON.parse(localStorage.getItem('comics_db') ?? '{"comics":[]}');
			const comic = comics.find((c: { id: string }) => c.id === id.comicId);
			return comic.characters.map(
				(c: { images: { panelId: string }[] }) =>
					c.images.filter((image) => image.panelId === id.panelId).length,
			);
		},
		{ comicId: EXAMPLE.id, panelId },
	);
}

/** Give the example's first panel a freshly generated image (and so stored crops). */
async function generatePanelImage(page: Page, times: 1 | 2 = 1) {
	await gotoHydrated(page, `/comic/${EXAMPLE.id}/${PANEL.id}`);
	await activate(page, page.getByRole('button', { name: m.removeImage() }));
	await activate(page, page.getByRole('button', { name: m.addImage() }));
	await expect(page.getByRole('img', { name: 'mock alt text' })).toBeVisible();
	await expect.poll(() => storedCropCounts(page, PANEL.id)).toEqual([1, 1]);
	if (times === 2) {
		await activate(page, page.getByRole('button', { name: m.generateNewImage() }));
		await expect.poll(() => storedCropCounts(page, PANEL.id)).toEqual([2, 2]);
	}
	await gotoHydrated(page, `/comic/${EXAMPLE.id}`);
}

/** A character's `<li>` in the characters list on the comic page. */
function characterSection(page: Page, name: string): Locator {
	return page
		.locator('ul[aria-labelledby="characters"] > li')
		.filter({ has: page.getByRole('heading', { name, exact: true }) });
}

const headAlt = (name: string) =>
	m.characterHeadAlt({ name, number: 1, title: PANEL.editorialTitle });
const fullAlt = (name: string) =>
	m.characterFullAlt({ name, number: 1, title: PANEL.editorialTitle });

/** The control that reveals a full-body crop, named after character and panel. */
const headControl = (page: Page, name: string): Locator =>
	characterSection(page, name).getByLabel(headAlt(name));

const previewCrop = (name: string) => m.characterPreviewCrop({ name, number: 1 });

function panelEntry(page: Page, name: string): Locator {
	return characterSection(page, name)
		.getByRole('list', { name: m.characterPanels() })
		.getByRole('listitem')
		.filter({ hasText: PANEL.editorialTitle });
}

test.describe('character gallery', () => {
	test(
		'an untouched example shows "No images yet" and no crops',
		{ tag: '@REQ-101-1' },
		async ({ page }) => {
			await gotoHydrated(page, `/comic/${EXAMPLE.id}`);

			for (const character of EXAMPLE.characters) {
				const section = characterSection(page, character.name);
				await expect(section.getByText(m.characterNoImages())).toBeVisible();
				await expect(section.getByRole('img')).toHaveCount(0);
			}
		},
	);

	test(
		'shows one head crop per generated character, named after character and panel',
		{ tag: ['@REQ-101-1', '@REQ-018'] },
		async ({ page }) => {
			await generatePanelImage(page);

			for (const { character } of HEAD_SIZES) {
				const section = characterSection(page, character.name);
				await expect(headControl(page, character.name)).toHaveCount(1);
				await expect(headControl(page, character.name).locator('img')).toHaveCount(1);
				await expect(section.getByText(m.characterNoImages())).toHaveCount(0);
			}
		},
	);

	for (const { character, width, height } of HEAD_SIZES) {
		test(
			`the head crop of ${character.name} has that character's own size`,
			{ tag: '@REQ-101-1' },
			async ({ page }) => {
				await generatePanelImage(page);

				const head = headControl(page, character.name).locator('img');
				await expect(head).toBeVisible();
				await expect
					.poll(() =>
						head.evaluate((img: HTMLImageElement) => [img.naturalWidth, img.naturalHeight]),
					)
					.toEqual([width, height]);
			},
		);
	}

	test(
		'activating a head crop shows its full-body crop',
		{ tag: '@REQ-101-1' },
		async ({ page }) => {
			await generatePanelImage(page);
			const section = characterSection(page, CHARACTER.name);
			const control = headControl(page, CHARACTER.name);
			const full = section.getByRole('img', { name: fullAlt(CHARACTER.name) });
			await expect(full).toBeHidden();

			await activate(page, control);

			await expect(full).toBeVisible();
			await expect(full.and(page.locator('img[src^="blob:"]'))).toBeVisible();
		},
	);

	test(
		'a panel image generated twice shows only the latest head crop',
		{ tag: '@REQ-101-1' },
		async ({ page }) => {
			await generatePanelImage(page, 2);

			for (const { character } of HEAD_SIZES) {
				await expect(headControl(page, character.name)).toHaveCount(1);
			}
		},
	);

	test(
		'deleting the panel removes its crop and brings back "No images yet"',
		{ tag: ['@REQ-101-1', '@REQ-047'] },
		async ({ page }) => {
			await generatePanelImage(page);
			await expect(headControl(page, CHARACTER.name)).toHaveCount(1);

			await activate(page, page.getByRole('button', { name: m.deletePanel({ number: 1 }) }));

			const section = characterSection(page, CHARACTER.name);
			await expect(headControl(page, CHARACTER.name)).toHaveCount(0);
			await expect(section.getByRole('img')).toHaveCount(0);
			await expect(section.getByText(m.characterNoImages())).toBeVisible();
		},
	);

	test(
		'still shows the head crop after a reload',
		{ tag: ['@REQ-101-1', '@REQ-022'] },
		async ({ page }) => {
			await generatePanelImage(page);
			const head = headControl(page, CHARACTER.name).locator('img');
			await expect(head).toBeVisible();

			await gotoHydrated(page, `/comic/${EXAMPLE.id}`);

			await expect(head).toBeVisible();
			await expect(head).toHaveAttribute('src', /^blob:/);
		},
	);
});

test.describe('character panel list', () => {
	test('previews a crop on an untouched example panel', { tag: '@REQ-014' }, async ({ page }) => {
		// Example images ship in static/, not OPFS; the preview must still read them.
		await gotoHydrated(page, `/comic/${EXAMPLE.id}`);
		const entry = panelEntry(page, CHARACTER.name);

		await activate(page, entry.getByRole('button', { name: previewCrop(CHARACTER.name) }));

		await expect(entry.locator('img[src^="blob:"]')).toBeVisible();
	});

	test(
		'offers no "create" for a panel with a stored crop',
		{ tag: '@REQ-014' },
		async ({ page }) => {
			await generatePanelImage(page);

			for (const { character } of HEAD_SIZES) {
				const entry = panelEntry(page, character.name);
				await expect(entry).toBeVisible();
				await expect(entry.getByRole('button', { name: previewCrop(character.name) })).toHaveCount(
					0,
				);
				await expect(entry).not.toContainText('Is generated');
			}
		},
	);
});
