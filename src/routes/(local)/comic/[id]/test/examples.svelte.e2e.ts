import { m } from '$lib/paraglide/messages';
import { expect, test } from '@playwright/test';
import {
	EXAMPLE_COMPLETE,
	exampleMinimal,
	exampleNoImages,
} from '../../../../../tests/e2e/examples';
import { activate } from '../../../../../tests/e2e/keyboard';
import { ComicPage } from './utils/comicPage';

test(
	'complete example shows its cover and every panel with its image',
	{ tag: '@REQ-010' },
	async ({ page }) => {
		const comicPage = await new ComicPage(page, EXAMPLE_COMPLETE).goto();

		expect(EXAMPLE_COMPLETE.cover).toBeDefined();
		expect(EXAMPLE_COMPLETE.panels).toHaveLength(3);
		await expect(comicPage.initialCoverImage).toBeVisible();
		await expect(comicPage.listItems).toHaveCount(3);
		for (const panel of EXAMPLE_COMPLETE.panels) {
			expect(panel.image).toBeDefined();
			const thumbnail = comicPage.listItems.getByRole('img', { name: panel.editorialTitle });
			await expect(thumbnail).toBeVisible();
			await expect
				.poll(() => thumbnail.evaluate((img: HTMLImageElement) => img.naturalWidth))
				.toBeGreaterThan(0);
		}
	},
);

test(
	'complete example lists the panels of each of its two characters and previews their head crop',
	{ tag: '@REQ-014' },
	async ({ page }) => {
		await new ComicPage(page, EXAMPLE_COMPLETE).goto();
		expect(EXAMPLE_COMPLETE.characters).toHaveLength(2);

		for (const character of EXAMPLE_COMPLETE.characters) {
			const panels = EXAMPLE_COMPLETE.panels.filter((panel) =>
				panel.image?.landscape.characters?.some(({ id }) => id === character.id),
			);
			expect(panels.length).toBeGreaterThan(0);

			const entries = page
				.getByRole('heading', { name: character.name })
				.locator('xpath=following-sibling::ul[1]')
				.getByRole('listitem');
			await expect(entries).toHaveCount(panels.length);

			for (const panel of panels) {
				const entry = entries.filter({ hasText: panel.editorialTitle });
				const number = EXAMPLE_COMPLETE.panels.indexOf(panel) + 1;
				await activate(
					page,
					entry.getByRole('button', {
						name: m.characterPreviewCrop({ name: character.name, number }),
					}),
				);
				await expect(entry.locator('img[src^="blob:"]')).toBeVisible();
			}
		}
	},
);

test(
	'example without images renders without a cover and lists both panels',
	{ tag: '@REQ-010' },
	async ({ page }) => {
		const example = exampleNoImages();
		expect(example.cover).toBeUndefined();
		const comicPage = await new ComicPage(page, example).goto();

		await expect(comicPage.heading).toBeVisible();
		await expect(page.getByRole('button', { name: m.addCover() })).toBeVisible();
		await expect(page.getByRole('button', { name: m.deleteCover() })).toBeHidden();
		await expect(comicPage.listItems).toHaveCount(2);
		await expect(page.getByRole('img')).toHaveCount(0);
	},
);

test('minimal example lists exactly one panel', { tag: '@REQ-010' }, async ({ page }) => {
	const example = exampleMinimal();
	const comicPage = await new ComicPage(page, example).goto();

	await expect(comicPage.heading).toBeVisible();
	await expect(comicPage.listItems).toHaveCount(1);
	await expect(comicPage.initialCoverImage).toBeVisible();
});
