import { m } from '$lib/paraglide/messages';
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import {
	errorRegion,
	expectFriendlyAiError,
	NO_IMAGE,
	NO_IMAGE_ONCE,
	openDetails,
	submitWithInstructions,
} from '../../../../../../tests/e2e/aiFailures';
import {
	createComicAtFirstPanel,
	imagesFromPanel,
	storedComic,
} from '../../../../../../tests/e2e/createdComic';
import { panelImageSrc, storedFiles } from '../../../../../../tests/e2e/storage';

const addImage = (page: Page) => page.getByRole('button', { name: m.addImage() });
const panelImage = (page: Page) => page.getByRole('img', { name: 'mock alt text' });

/** A panel image that is shown, stored in OPFS and recorded in the snapshot like any other. */
async function expectStoredImage(page: Page, comicId: string, panelId: string, files: string[]) {
	await expect(panelImage(page)).toBeVisible();
	await expect.poll(() => panelImageSrc(page, comicId, panelId)).toBeDefined();
	expect(imagesFromPanel(await storedComic(page, comicId), panelId)).not.toEqual([]);
	expect((await storedFiles(page)).length).toBeGreaterThan(files.length);
}

test(
	'retries once when the first response has no image',
	{ tag: ['@REQ-185-1', '@REQ-015'] },
	async ({ page }) => {
		const { comicId, panelId } = await createComicAtFirstPanel(page);
		const files = await storedFiles(page);

		await submitWithInstructions(page, addImage(page), NO_IMAGE_ONCE);

		await expectStoredImage(page, comicId, panelId, files);
		await expect(errorRegion(page)).toBeEmpty();
	},
);

test.describe('when every response has no image', () => {
	test(
		'shows a friendly message and saves nothing',
		{ tag: ['@REQ-185-2', '@REQ-009'] },
		async ({ page }) => {
			const { comicId, panelId } = await createComicAtFirstPanel(page);
			const url = page.url();
			const files = await storedFiles(page);

			await submitWithInstructions(page, addImage(page), NO_IMAGE);

			await expectFriendlyAiError(page, m.aiNoImage());
			await expect(panelImage(page)).toHaveCount(0);
			expect(await panelImageSrc(page, comicId, panelId)).toBeUndefined();
			expect(await storedFiles(page)).toEqual(files);
			expect(page.url()).toBe(url);
		},
	);

	test(
		'hides the technical message until "Show details" is opened',
		{ tag: ['@REQ-185-2', '@REQ-035'] },
		async ({ page }) => {
			await createComicAtFirstPanel(page);
			await submitWithInstructions(page, addImage(page), NO_IMAGE);
			await expectFriendlyAiError(page, m.aiNoImage());

			await openDetails(page);

			const { violations } = await new AxeBuilder({ page }).analyze();
			expect(
				violations.map(({ id, nodes }) => ({ id, nodes: nodes.map((n) => n.target) })),
			).toEqual([]);
		},
	);

	test(
		'clears the error and adds the image when submitted again',
		{ tag: ['@REQ-185-2', '@REQ-009'] },
		async ({ page }) => {
			const { comicId, panelId } = await createComicAtFirstPanel(page);
			const files = await storedFiles(page);
			await submitWithInstructions(page, addImage(page), NO_IMAGE);
			await expectFriendlyAiError(page, m.aiNoImage());

			await submitWithInstructions(page, addImage(page), '');

			await expectStoredImage(page, comicId, panelId, files);
			await expect(errorRegion(page).getByText(m.aiNoImage())).toHaveCount(0);
			await expect(errorRegion(page).getByText(m.showDetails())).toHaveCount(0);
		},
	);
});
