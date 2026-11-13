import { m } from '$lib/paraglide/messages';
import { expect, test, type Page } from '@playwright/test';
import { gotoHydrated } from '../../../../../tests/e2e/gotoHydrated';
import { activate, typeInto } from '../../../../../tests/e2e/keyboard';

const MAX_IMAGE_BYTES = 100 * 1024;

/** Size in bytes of every file in OPFS (generated covers, panel images, crops). */
function storedFileSizes(page: Page): Promise<number[]> {
	return page.evaluate(async () => {
		const root = await navigator.storage.getDirectory();
		const sizes: number[] = [];
		const entries = (
			root as unknown as { entries(): AsyncIterable<[string, FileSystemFileHandle]> }
		).entries();
		for await (const [, handle] of entries) {
			sizes.push((await handle.getFile()).size);
		}
		return sizes;
	});
}

test(
	'a created comic gets small mock cover and panel images and still gets character crops',
	{ tag: ['@REQ-005', '@REQ-006', '@REQ-018'] },
	async ({ page }) => {
		await gotoHydrated(page, '/comic/create');
		await typeInto(page, page.getByRole('textbox', { name: m.url() }), 'https://example.com/a');
		await activate(page, page.getByRole('button', { name: m.submit() }));
		await expect(page).toHaveURL(/\/comic\/[0-9a-f-]{36}$/);
		// The generated cover is stored.
		await expect(page.getByRole('button', { name: m.deleteCover() })).toBeVisible();

		await activate(page, page.locator('ul[aria-labelledby="panels"] > li a').first());
		await activate(page, page.getByRole('button', { name: m.addImage() }));
		await expect(page.getByRole('img', { name: 'mock alt text' })).toBeVisible();
		// Crops of the comic's own characters sit next to the dialogue.
		await expect(
			page
				.getByRole('list', { name: m.dialogues() })
				.getByRole('img', { name: 'charachter' })
				.first(),
		).toBeVisible();

		await expect.poll(async () => (await storedFileSizes(page)).length).toBeGreaterThanOrEqual(2);
		const sizes = await storedFileSizes(page);
		for (const size of sizes) {
			expect(size).toBeGreaterThan(0);
			expect(size).toBeLessThan(MAX_IMAGE_BYTES);
		}
	},
);
