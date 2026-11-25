import { m } from '#lib/paraglide/messages.js';
import { expect, test, type Page } from '@playwright/test';
import { submitWithInstructions } from '../../../../../../tests/e2e/aiFailures';
import { storedComic } from '../../../../../../tests/e2e/createdComic';
import { gotoHydrated } from '../../../../../../tests/e2e/gotoHydrated';
import {
	generatingDialog,
	cancelGenerationButton,
} from '../../../../../../tests/e2e/generatingOverlay';
import {
	comicWithImage,
	createComicWithFormat,
	panelImages,
} from '../../../../../../tests/e2e/imageFormat';
import { activate } from '../../../../../../tests/e2e/keyboard';
import {
	aiCalls,
	expectCallReachedServer,
	holdMarker,
	newToken,
	recordMarker,
} from '../../../../../../tests/e2e/serverAiCalls';

const generateButton = (page: Page) =>
	page.getByRole('button', { name: m.generateNewImage(), exact: true });

/** No further call or abort shows up once the server has had time to start one. */
async function expectNoMoreCalls(page: Page, token: string, calls: number) {
	// A round trip to the page and back gives a wrongly started call time to be recorded.
	await page.evaluate(() => new Promise((resolve) => setTimeout(resolve, 500)));
	expect((await aiCalls(page, token)).calls).toBe(calls);
}

test(
	'Cancel generation aborts the server call for the request',
	{ tag: ['@REQ-315-1', '@REQ-301-3'] },
	async ({ page }) => {
		const token = newToken();
		await comicWithImage(page, 'both');
		await submitWithInstructions(page, generateButton(page), holdMarker(token));
		await expect(generatingDialog(page)).toBeVisible();
		await expectCallReachedServer(page, token);

		await activate(page, cancelGenerationButton(page));

		await expect(generatingDialog(page)).toBeHidden();
		await expect.poll(async () => (await aiCalls(page, token)).aborts).toBe(1);
	},
);

test(
	'leaving the panel page aborts the server call for the request',
	{ tag: ['@REQ-315-1', '@REQ-301-4'] },
	async ({ page }) => {
		const token = newToken();
		const { comicId, panelId } = await comicWithImage(page, 'both');
		const panel = (await storedComic(page, comicId)).panels[0];
		// Arrive by in-app navigation, so Back is a client-side navigation.
		await gotoHydrated(page, `/comic/${comicId}`);
		await activate(
			page,
			page.getByRole('link', { name: panel?.editorialTitle || m.panel({ number: 1 }) }).first(),
		);
		await expect(page).toHaveURL(new RegExp(`/comic/${comicId}/${panelId}$`));
		await submitWithInstructions(page, generateButton(page), holdMarker(token));
		await expect(generatingDialog(page)).toBeVisible();
		await expectCallReachedServer(page, token);

		await page.goBack();

		await expect(page).toHaveURL(new RegExp(`/comic/${comicId}$`));
		await expect.poll(async () => (await aiCalls(page, token)).aborts).toBe(1);
	},
);

test(
	'cancelling a Portrait and landscape generation held on its first variant starts no second call or retry',
	{ tag: ['@REQ-315-1', '@REQ-103-3', '@REQ-185-1'] },
	async ({ page }) => {
		const token = newToken();
		const { comicId, panelId } = await createComicWithFormat(page, 'both');
		await gotoHydrated(page, `/comic/${comicId}/${panelId}`);
		await submitWithInstructions(
			page,
			page.getByRole('button', { name: m.addImage() }),
			holdMarker(token),
		);
		await expect(generatingDialog(page)).toBeVisible();
		await expectCallReachedServer(page, token);

		await activate(page, cancelGenerationButton(page));

		await expect(generatingDialog(page)).toBeHidden();
		await expect.poll(async () => (await aiCalls(page, token)).aborts).toBe(1);
		await expectNoMoreCalls(page, token, 1);
		expect((await aiCalls(page, token)).aborts).toBe(1);
	},
);

test(
	'a generation that is not cancelled records no abort and saves the image',
	{ tag: ['@REQ-315-1', '@REQ-103-3'] },
	async ({ page }) => {
		const token = newToken();
		await comicWithImage(page, 'both');

		await submitWithInstructions(page, generateButton(page), recordMarker(token));

		await expect(generatingDialog(page)).toBeHidden();
		await expect(panelImages(page)).toHaveCount(2);
		await expect(page.getByRole('button', { name: m.restorePreviousImage() })).toBeVisible();
		// One call per variant, and nothing was aborted.
		expect(await aiCalls(page, token)).toEqual({ calls: 2, aborts: 0 });
	},
);
