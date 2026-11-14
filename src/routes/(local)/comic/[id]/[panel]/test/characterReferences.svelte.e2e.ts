import { m } from '$lib/paraglide/messages';
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import {
	createComic,
	deletePanel,
	generatePanelImage,
	imagesFromPanel,
	storedComic,
} from '../../../../../../tests/e2e/createdComic';
import { activate, typeInto } from '../../../../../../tests/e2e/keyboard';
import { panelImageSrc, storedFiles } from '../../../../../../tests/e2e/storage';
import {
	chooseReference,
	cropBytes,
	createComicWithImageOnFirstPanel,
	gotoPanel,
	noneOption,
	referenceGroup,
	referenceOption,
	speakers,
	submitAndCaptureBody,
} from './utils/characterReferences';

const addImage = (page: Page) => page.getByRole('button', { name: m.addImage() });
const replaceImage = (page: Page) => page.getByRole('button', { name: m.generateNewImage() });
const anyReference = (page: Page) => page.getByRole('radio');

test.describe('character references on the panel image form', () => {
	test(
		'offers the crop from the other panel, with None selected and the head crop as thumbnail',
		{ tag: '@REQ-100-1' },
		async ({ page }) => {
			const { comicId, b, shared } = await createComicWithImageOnFirstPanel(page);

			await gotoPanel(page, comicId, b.id);

			const group = referenceGroup(page, shared.name);
			await expect(group).toBeVisible();
			await expect(group).toHaveAccessibleDescription(m.characterReferenceHint());
			await expect(noneOption(group)).toBeChecked();
			await expect(group.getByRole('radio')).toHaveCount(2);
			const option = referenceOption(group, 1);
			await expect(option).not.toBeChecked();
			const thumbnail = group.getByRole('img');
			await expect(thumbnail).toHaveCount(1);
			await expect(thumbnail).toHaveAttribute('alt', /\S/);
			await expect
				.poll(() =>
					thumbnail.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0),
				)
				.toBe(true);
		},
	);

	test(
		'shows no picker before any crop exists, and shows it once another panel has one',
		{ tag: '@REQ-100-1' },
		async ({ page }) => {
			const comicId = await createComic(page);
			const [a, b] = (await storedComic(page, comicId)).panels;
			if (!a || !b) throw new Error('created comic needs two panels');
			await gotoPanel(page, comicId, b.id);
			await expect(addImage(page)).toBeVisible();
			await expect(anyReference(page)).toHaveCount(0);

			// The same comic offers the picker as soon as another panel has crops.
			await generatePanelImage(page, comicId, a.id);
			await gotoPanel(page, comicId, b.id);
			await expect(anyReference(page).first()).toBeVisible();
		},
	);

	test('lists only characters in the panel dialogue', { tag: '@REQ-100-1' }, async ({ page }) => {
		const { comicId, b, shared, silentInB, comic } = await createComicWithImageOnFirstPanel(page);
		expect(silentInB.images).not.toEqual([]);

		await gotoPanel(page, comicId, b.id);

		await expect(referenceGroup(page, shared.name)).toBeVisible();
		await expect(referenceGroup(page, silentInB.name)).toHaveCount(0);
		await expect(page.getByRole('group')).toHaveCount(speakers(comic, b.id).length);
	});

	test(
		"does not offer a panel's own crops on its replace form",
		{ tag: '@REQ-100-1' },
		async ({ page }) => {
			const { comicId, a, b, shared } = await createComicWithImageOnFirstPanel(page);

			await gotoPanel(page, comicId, a.id);
			await expect(replaceImage(page)).toBeVisible();
			await expect(anyReference(page)).toHaveCount(0);

			await generatePanelImage(page, comicId, b.id);
			await gotoPanel(page, comicId, a.id);
			const group = referenceGroup(page, shared.name);
			await expect(group).toBeVisible();
			await expect(referenceOption(group, 2)).toBeVisible();
			await expect(referenceOption(group, 1)).toHaveCount(0);
		},
	);

	test(
		'stops offering a deleted panel as a reference',
		{ tag: ['@REQ-100-1', '@REQ-047'] },
		async ({ page }) => {
			const { comicId, b, shared } = await createComicWithImageOnFirstPanel(page);
			await gotoPanel(page, comicId, b.id);
			await expect(referenceOption(referenceGroup(page, shared.name), 1)).toBeVisible();

			await deletePanel(page, comicId, 1);

			await gotoPanel(page, comicId, b.id);
			await expect(addImage(page)).toBeVisible();
			await expect(anyReference(page)).toHaveCount(0);
		},
	);

	test(
		'sends the chosen full-body crop and keeps the result after a reload',
		{ tag: ['@REQ-100-2', '@REQ-015', '@REQ-022'] },
		async ({ page }) => {
			const { comicId, b, shared, imagesOfA, comic } = await createComicWithImageOnFirstPanel(page);
			const chosen = imagesOfA.find(({ id }) => shared.images.some((image) => image.id === id));
			const other = speakers(comic, b.id).find(({ id }) => id !== shared.id);
			const otherCrop = imagesOfA.find(({ id }) => other?.images.some((image) => image.id === id));
			if (!chosen || !otherCrop) throw new Error('mock comic needs crops for two speakers');
			const bytes = await cropBytes(page, chosen);
			const otherBytes = await cropBytes(page, otherCrop);

			await gotoPanel(page, comicId, b.id);
			await chooseReference(page, referenceGroup(page, shared.name), 1);
			const body = await submitAndCaptureBody(page, addImage(page));

			expect(body).toContain(bytes.full);
			expect(body).not.toContain(bytes.head);
			expect(body).not.toContain(otherBytes.full);
			await expect(page.getByRole('img', { name: 'mock alt text' })).toBeVisible();
			await expect
				.poll(async () => imagesFromPanel(await storedComic(page, comicId), b.id))
				.not.toEqual([]);

			await page.reload();
			await expect(page.getByRole('img', { name: 'mock alt text' })).toBeVisible();
			expect(await panelImageSrc(page, comicId, b.id)).toBeDefined();
			expect(imagesFromPanel(await storedComic(page, comicId), b.id)).not.toEqual([]);
		},
	);

	test(
		'sends no character reference when none is chosen',
		{ tag: '@REQ-100-2' },
		async ({ page }) => {
			const { comicId, b, shared, imagesOfA } = await createComicWithImageOnFirstPanel(page);
			await gotoPanel(page, comicId, b.id);
			// The picker is there, so sending nothing is a choice the user made.
			await expect(noneOption(referenceGroup(page, shared.name))).toBeChecked();

			const body = await submitAndCaptureBody(page, addImage(page));

			for (const image of imagesOfA) {
				const bytes = await cropBytes(page, image);
				expect(body).not.toContain(bytes.head);
				expect(body).not.toContain(bytes.full);
			}
			await expect(page.getByRole('img', { name: 'mock alt text' })).toBeVisible();
		},
	);

	test(
		'sends the current image and the chosen crop when replacing',
		{ tag: ['@REQ-100-2', '@REQ-016'] },
		async ({ page }) => {
			const { comicId, b, shared, imagesOfA } = await createComicWithImageOnFirstPanel(page);
			await generatePanelImage(page, comicId, b.id);
			const chosen = imagesOfA.find(({ id }) => shared.images.some((image) => image.id === id));
			if (!chosen) throw new Error('mock comic needs a crop of the shared speaker');
			const bytes = await cropBytes(page, chosen);
			const before = await panelImageSrc(page, comicId, b.id);
			expect(before).toBeDefined();

			await gotoPanel(page, comicId, b.id);
			const group = referenceGroup(page, shared.name);
			// Its own crops (from B) are not offered; A's is.
			await expect(group.getByRole('radio')).toHaveCount(2);
			await activate(page, page.getByRole('checkbox', { name: m.includeImage() }), 'Space');
			await chooseReference(page, group, 1);
			const body = await submitAndCaptureBody(page, replaceImage(page));

			expect(body).toContain(bytes.full);
			expect(body).toMatch(/name="includeImage"/);
			expect(body).toContain('data:image');
			await expect.poll(() => panelImageSrc(page, comicId, b.id)).not.toBe(before);
		},
	);

	test(
		'leaves the panel, files and metadata unchanged when generation fails',
		{ tag: ['@REQ-100-2', '@REQ-025'] },
		async ({ page }) => {
			const { comicId, b, shared, imagesOfA } = await createComicWithImageOnFirstPanel(page);
			const chosen = imagesOfA.find(({ id }) => shared.images.some((image) => image.id === id));
			if (!chosen) throw new Error('mock comic needs a crop of the shared speaker');
			const bytes = await cropBytes(page, chosen);
			await gotoPanel(page, comicId, b.id);
			const metadata = await storedComic(page, comicId);
			const files = await storedFiles(page);

			await chooseReference(page, referenceGroup(page, shared.name), 1);
			await typeInto(
				page,
				page.getByRole('textbox', { name: m.instructions() }),
				'mock-error:upstream',
			);
			const body = await submitAndCaptureBody(page, addImage(page));

			expect(body).toContain(bytes.full);
			await expect(page.getByText(m.error(), { exact: true })).toBeVisible();
			expect(await storedComic(page, comicId)).toEqual(metadata);
			expect(await storedFiles(page)).toEqual(files);
			await expect(addImage(page)).toBeVisible();
		},
	);

	for (const colorScheme of ['light', 'dark'] as const) {
		test(
			`the picker has no axe violations in the ${colorScheme} colour scheme`,
			{ tag: ['@REQ-035', '@REQ-100-1'] },
			async ({ page }) => {
				await page.emulateMedia({ colorScheme });
				const { comicId, b, shared } = await createComicWithImageOnFirstPanel(page);
				await gotoPanel(page, comicId, b.id);
				await expect(referenceGroup(page, shared.name)).toBeVisible();

				const { violations } = await new AxeBuilder({ page }).analyze();

				expect(
					violations.map(({ id, nodes }) => ({ id, nodes: nodes.map((n) => n.target) })),
				).toEqual([]);
			},
		);
	}

	test.describe('at 320 px', { tag: ['@REQ-040', '@REQ-100-1'] }, () => {
		test.use({ viewport: { width: 320, height: 640 } });

		test('the picker does not scroll horizontally', async ({ page }) => {
			const { comicId, b, shared } = await createComicWithImageOnFirstPanel(page);
			await gotoPanel(page, comicId, b.id);
			await expect(referenceGroup(page, shared.name)).toBeVisible();

			const { scrollWidth, clientWidth } = await page.evaluate(() => ({
				scrollWidth: document.documentElement.scrollWidth,
				clientWidth: document.documentElement.clientWidth,
			}));

			expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
		});
	});
});
