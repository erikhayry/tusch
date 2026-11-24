import AxeBuilder from '@axe-core/playwright';
import { m } from '#lib/paraglide/messages.js';
import { expect, test, type Locator, type Page } from '@playwright/test';
import { errorRegion, submitWithInstructions } from '../../../../../../tests/e2e/aiFailures';
import { storedComic } from '../../../../../../tests/e2e/createdComic';
import { gotoHydrated } from '../../../../../../tests/e2e/gotoHydrated';
import { holdRequest } from '../../../../../../tests/e2e/holdRequest';
import {
	comicWithImage,
	createComicWithFormat,
	panelImages,
	setImageFormat,
	type ImageFormat,
} from '../../../../../../tests/e2e/imageFormat';
import { activate } from '../../../../../../tests/e2e/keyboard';
import { storedFiles } from '../../../../../../tests/e2e/storage';
import {
	CREATE_IMAGE_REQUEST,
	cancelGenerationButton,
	firstPanelHeading,
	generatingDialog,
	holdImageRequestsForever,
	storedPanelImage,
} from './utils/generatingOverlay';

const generateButton = (page: Page) =>
	page.getByRole('button', { name: m.generateNewImage(), exact: true });
const createButton = (page: Page, variant: 'portrait' | 'landscape') =>
	page.getByRole('button', {
		name: variant === 'portrait' ? m.createPortraitImage() : m.createLandscapeImage(),
		exact: true,
	});
const timer = (page: Page) => generatingDialog(page).getByRole('timer');

/** Open the overlay on a created comic's panel and keep its request open. */
async function openOverlay(page: Page, format: ImageFormat = 'both') {
	const { comicId, panelId } = await comicWithImage(page, format);
	const aborted = await holdImageRequestsForever(page);
	await activate(page, generateButton(page));
	await expect(generatingDialog(page)).toBeVisible();
	return { comicId, panelId, aborted };
}

test(
	'generating a new image opens a dialog with the panel, its title and both variants instead of the loader',
	{ tag: ['@REQ-301-1', '@REQ-041', '@REQ-042'] },
	async ({ page }) => {
		const { comicId } = await comicWithImage(page, 'both');
		const title = (await storedComic(page, comicId)).panels[0]?.editorialTitle ?? '';
		expect(title).not.toBe('');
		const release = await holdRequest(page, CREATE_IMAGE_REQUEST);

		await activate(page, generateButton(page));

		const dialog = generatingDialog(page);
		await expect(dialog).toBeVisible();
		await expect(dialog).toContainText(m.panel({ number: 1 }));
		await expect(dialog).toContainText(title);
		await expect(dialog).toContainText(m.generatingImageBoth());
		await expect(
			dialog.getByRole('progressbar', { name: m.generatingImageProgress() }),
		).toBeVisible();
		await expect(dialog.getByText(m.generatingImageElapsed(), { exact: true })).toBeVisible();
		await expect(dialog.getByText(m.generatingImageNote())).toBeVisible();
		await expect(cancelGenerationButton(page)).toBeVisible();
		// The overlay replaces the global loader: no bar, label or seconds timer.
		await expect(page.getByText(m.loadingCreatePanelImage())).toBeHidden();
		await expect(page.getByRole('progressbar')).toHaveCount(1);
		await expect(page.getByText(m.elapsedSeconds({ seconds: 0 }), { exact: true })).toBeHidden();

		release();
	},
);

const VARIANT_CASES = [
	{
		name: 'a portrait-only comic names only portrait',
		format: 'portrait',
		then: undefined,
		button: generateButton,
		shown: () => m.generatingImagePortrait(),
		hidden: () => m.generatingImageLandscape(),
	},
	{
		name: 'a missing landscape variant names only landscape',
		format: 'portrait',
		then: 'both',
		button: (page: Page) => createButton(page, 'landscape'),
		shown: () => m.generatingImageLandscape(),
		hidden: () => m.generatingImagePortrait(),
	},
	{
		name: 'a missing portrait variant names only portrait',
		format: 'landscape',
		then: 'both',
		button: (page: Page) => createButton(page, 'portrait'),
		shown: () => m.generatingImagePortrait(),
		hidden: () => m.generatingImageLandscape(),
	},
] as const;

for (const variantCase of VARIANT_CASES) {
	test(`the subtitle for ${variantCase.name}`, { tag: ['@REQ-301-1'] }, async ({ page }) => {
		const { comicId, panelId } = await comicWithImage(page, variantCase.format);
		if (variantCase.then) {
			await setImageFormat(page, comicId, variantCase.then);
			await gotoHydrated(page, `/comic/${comicId}/${panelId}`);
		}
		await holdImageRequestsForever(page);

		await activate(page, variantCase.button(page));

		const dialog = generatingDialog(page);
		await expect(dialog).toBeVisible();
		await expect(dialog).toContainText(variantCase.shown());
		await expect(dialog).not.toContainText(variantCase.hidden());
		await expect(dialog).not.toContainText(m.generatingImageBoth());
	});
}

test('the timer counts up from 0:00', { tag: ['@REQ-301-1'] }, async ({ page }) => {
	await openOverlay(page);

	await expect(timer(page)).toHaveText('0:00');
	await expect(timer(page)).not.toHaveText('0:00');
	await expect(timer(page)).toHaveText(/^0:0[1-9]$/);
});

test(
	'the dialog closes and the new image shows when the request succeeds',
	{ tag: ['@REQ-301-1'] },
	async ({ page }) => {
		await comicWithImage(page, 'both');
		const release = await holdRequest(page, CREATE_IMAGE_REQUEST);
		await activate(page, generateButton(page));
		await expect(generatingDialog(page)).toBeVisible();

		release();

		await expect(generatingDialog(page)).toBeHidden();
		await expect(panelImages(page).first()).toBeVisible();
		await expect(errorRegion(page)).toBeHidden();
	},
);

test(
	'the dialog closes and the error shows when the request fails',
	{ tag: ['@REQ-301-1'] },
	async ({ page }) => {
		await comicWithImage(page, 'both');
		const release = await holdRequest(page, CREATE_IMAGE_REQUEST);
		await submitWithInstructions(page, generateButton(page), 'mock-error:upstream');
		await expect(generatingDialog(page)).toBeVisible();

		release();

		await expect(generatingDialog(page)).toBeHidden();
		await expect(errorRegion(page)).toBeVisible();
	},
);

test(
	'Tab stays on Cancel generation and Escape leaves the dialog open',
	{ tag: ['@REQ-301-2'] },
	async ({ page }) => {
		await openOverlay(page);
		const cancel = cancelGenerationButton(page);
		await expect(cancel).toBeFocused();
		expect(await generatingDialog(page).evaluate((el) => el.matches(':modal'))).toBe(true);

		for (const key of ['Tab', 'Tab', 'Shift+Tab', 'Tab']) {
			await page.keyboard.press(key);
			await expect(cancel).toBeFocused();
		}
		// Twice: Chrome closes a modal on a second Escape even when the first was prevented.
		await page.keyboard.press('Escape');
		await page.keyboard.press('Escape');

		await expect(generatingDialog(page)).toBeVisible();
		await expect(cancel).toBeFocused();
	},
);

test(
	'focus returns to the button that started the image when the dialog closes',
	{ tag: ['@REQ-301-2'] },
	async ({ page }) => {
		await comicWithImage(page, 'both');
		const release = await holdRequest(page, CREATE_IMAGE_REQUEST);
		await activate(page, generateButton(page));
		await expect(generatingDialog(page)).toBeVisible();

		release();

		await expect(generatingDialog(page)).toBeHidden();
		await expect(generateButton(page)).toBeFocused();
	},
);

test(
	'focus moves to the panel heading when the button that started the image is gone',
	{ tag: ['@REQ-301-2'] },
	async ({ page }) => {
		const { comicId, panelId } = await createComicWithFormat(page, 'both');
		await gotoHydrated(page, `/comic/${comicId}/${panelId}`);
		const heading = await firstPanelHeading(page, comicId);
		const release = await holdRequest(page, CREATE_IMAGE_REQUEST);
		await activate(page, page.getByRole('button', { name: m.addImage() }));
		await expect(generatingDialog(page)).toBeVisible();

		release();

		await expect(generatingDialog(page)).toBeHidden();
		await expect(panelImages(page).first()).toBeVisible();
		await expect(heading).toBeFocused();
	},
);

async function expectPanelUnchanged(
	page: Page,
	comicId: string,
	panelId: string,
	before: { image: unknown; files: string[] },
) {
	await expect(errorRegion(page)).toBeHidden();
	expect(await storedPanelImage(page, comicId, panelId)).toEqual(before.image);
	expect(await storedFiles(page)).toEqual(before.files);
	await expect(page.getByRole('button', { name: m.restorePreviousImage() })).toBeHidden();
}

test(
	'Cancel generation aborts the request and leaves the panel as it was',
	{ tag: ['@REQ-301-3'] },
	async ({ page }) => {
		const { comicId, panelId } = await comicWithImage(page, 'both');
		const before = {
			image: await storedPanelImage(page, comicId, panelId),
			files: await storedFiles(page),
		};
		const aborted = await holdImageRequestsForever(page);
		await activate(page, generateButton(page));
		await expect(generatingDialog(page)).toBeVisible();

		await activate(page, cancelGenerationButton(page));

		await expect(generatingDialog(page)).toBeHidden();
		await expect.poll(() => aborted.length).toBe(1);
		await expectPanelUnchanged(page, comicId, panelId, before);
		await expect(panelImages(page)).toHaveCount(2);

		await gotoHydrated(page, `/comic/${comicId}/${panelId}`);
		await expect(panelImages(page)).toHaveCount(2);
		await expectPanelUnchanged(page, comicId, panelId, before);
	},
);

test(
	'going back while the dialog is open aborts the request without a prompt',
	{ tag: ['@REQ-301-4'] },
	async ({ page }) => {
		const { comicId, panelId } = await comicWithImage(page, 'both');
		const before = {
			image: await storedPanelImage(page, comicId, panelId),
			files: await storedFiles(page),
		};
		const prompts: string[] = [];
		page.on('dialog', (prompt) => {
			prompts.push(prompt.type());
			void prompt.dismiss();
		});
		// Arrive by in-app navigation, so Back is a client-side navigation.
		await gotoHydrated(page, `/comic/${comicId}`);
		await activate(page, panelLink(page, (await storedComic(page, comicId)).panels[0]));
		await expect(page).toHaveURL(new RegExp(`/comic/${comicId}/${panelId}$`));
		const aborted = await holdImageRequestsForever(page);
		await activate(page, generateButton(page));
		await expect(generatingDialog(page)).toBeVisible();

		await page.goBack();

		await expect(page).toHaveURL(new RegExp(`/comic/${comicId}$`));
		await expect.poll(() => aborted.length).toBe(1);
		expect(prompts).toEqual([]);

		await page.goForward();
		await expect(generateButton(page)).toBeVisible();
		await expect(generatingDialog(page)).toBeHidden();
		await expectPanelUnchanged(page, comicId, panelId, before);
	},
);

function panelLink(page: Page, panel: { editorialTitle?: string } | undefined): Locator {
	return page.getByRole('link', { name: panel?.editorialTitle || m.panel({ number: 1 }) }).first();
}

test(
	'the opening announcement is the only live text and the timer is outside any live region',
	{ tag: ['@REQ-301-5', '@REQ-043'] },
	async ({ page }) => {
		await openOverlay(page);
		const dialog = generatingDialog(page);

		const announcement = dialog.getByText(m.generatingImageAnnouncement(), { exact: true });
		await expect(announcement).toHaveCount(1);
		expect(
			await announcement.evaluate((el) =>
				el.closest('[role="status"], [role="alert"], [aria-live]:not([aria-live="off"])')
					? true
					: false,
			),
		).toBe(true);
		await expect(timer(page)).toHaveAttribute('role', 'timer');
		expect(
			await timer(page).evaluate((el) =>
				el.closest(
					'[role="status"], [role="alert"], [role="log"], [aria-live]:not([aria-live="off"])',
				),
			),
		).toBeNull();
		// The timer keeps ticking without adding to what is announced.
		await expect(timer(page)).not.toHaveText('0:00');
		await expect(announcement).toHaveCount(1);
	},
);

const DURATIONS = [
	{ motion: 'no-preference', expected: [900, 1400], absent: [2400] },
	{ motion: 'reduce', expected: [2400], absent: [900, 1400] },
] as const;

for (const { motion, expected, absent } of DURATIONS) {
	test(`animation durations with ${motion} motion`, { tag: ['@REQ-301-6'] }, async ({ page }) => {
		await page.emulateMedia({ reducedMotion: motion });
		await openOverlay(page);

		const durations = await generatingDialog(page).evaluate((dialog) =>
			dialog
				.getAnimations({ subtree: true })
				.map((animation) => Number(animation.effect?.getTiming().duration)),
		);

		for (const duration of expected) {
			expect(durations).toContain(duration);
		}
		for (const duration of absent) {
			expect(durations).not.toContain(duration);
		}
	});
}

for (const colorScheme of ['light', 'dark'] as const) {
	test(
		`axe finds no violations with the dialog open in the ${colorScheme} scheme`,
		{ tag: ['@REQ-035', '@REQ-301-1'] },
		async ({ page }) => {
			await page.emulateMedia({ colorScheme });
			await openOverlay(page);

			const { violations } = await new AxeBuilder({ page }).analyze();

			expect(
				violations.map(({ id, impact, nodes }) => ({
					id,
					impact,
					nodes: nodes.map((node) => node.target.join(' ')),
				})),
			).toEqual([]);
		},
	);
}
