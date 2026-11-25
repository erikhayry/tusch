import { CREATE_COMIC_ACTION } from '#lib/features/comics/contracts/createComic.ts';
import { CREATE_COVER_IMAGE_ACTION } from '#lib/features/comics/contracts/createCoverImage.ts';
import { CREATE_PANEL_IMAGE_ACTION } from '#lib/features/panels/contracts/createPanelImage.ts';
import { m } from '#lib/paraglide/messages.js';
import { expect, test, type Page } from '@playwright/test';
import { errorRegion } from '../../../../../tests/e2e/aiFailures';
import { gotoHydrated } from '../../../../../tests/e2e/gotoHydrated';
import { activate, tabTo } from '../../../../../tests/e2e/keyboard';
import { metaLine } from '../../../../../tests/e2e/landingCopy';
import { storedComics } from '../../../../../tests/e2e/storage';
import { STYLE_CARDS } from '../../../../../tests/e2e/comicStyles';
import { ComicSchema } from '#lib/types/index.ts';
import { LandingPage } from '../../../test/utils/landingPage';
import { CreatePage } from './utils/createPage';

const STORY = 'A lighthouse keeper finds a message in a bottle.\nIt leads her to a hidden cove.';
const COMIC_URL = /\/comic\/[0-9a-f-]{36}$/;
const DESCRIPTION = 'Soft watercolour washes with loose pencil lines';

/** Fill the form with a story and a custom description; leave it ready to submit. */
async function fillCustom(page: Page, description: string) {
	const createPage = await new CreatePage(page).goto();
	await createPage.pasteStory(STORY);
	await createPage.chooseStyle(m.styleCustom());
	await expect(createPage.customStyleInput).toBeVisible();
	await tabTo(page, createPage.customStyleInput);
	await page.keyboard.press('ControlOrMeta+A');
	await page.keyboard.insertText(description);
	return createPage;
}

/** A comic made with a custom style through the UI; returns its id. */
async function createCustomComic(page: Page, description = DESCRIPTION) {
	const createPage = await fillCustom(page, description);
	await createPage.submit();
	await expect(page).toHaveURL(COMIC_URL);
	return page.url().split('/').at(-1) ?? '';
}

test.describe('the Custom style field', { tag: '@REQ-97-1' }, () => {
	test('is the last card, and its text area shows only while Custom is checked', async ({
		page,
	}) => {
		const createPage = await new CreatePage(page).goto();
		const group = page.getByRole('group', { name: m.comicStyles() });

		await expect(group.getByRole('radio').nth(10)).toHaveAccessibleName(m.styleCustom());
		await expect(createPage.customStyleInput).toHaveCount(0);

		await createPage.chooseStyle(m.styleCustom());
		await expect(createPage.customStyleInput).toBeVisible();
		await expect(createPage.customStyleInput).toHaveAttribute('required', '');
		// Below the cards.
		const cards = await group.boundingBox();
		const field = await createPage.customStyleInput.boundingBox();
		expect(cards && field && field.y >= cards.y + cards.height).toBe(true);

		await page.keyboard.press('ArrowLeft');
		await expect(createPage.styleRadio(m.styleUkiyoE())).toBeChecked();
		await expect(createPage.customStyleInput).toHaveCount(0);
	});

	test('the counter reads "<n> of 500" and follows the typing', async ({ page }) => {
		const createPage = await new CreatePage(page).goto();
		await createPage.chooseStyle(m.styleCustom());
		await expect(createPage.customStyleCount).toHaveText('0 of 500');

		await tabTo(page, createPage.customStyleInput);
		await page.keyboard.insertText('hello');
		await expect(createPage.customStyleCount).toHaveText('5 of 500');
		await page.keyboard.type('!!');
		await expect(createPage.customStyleCount).toHaveText('7 of 500');
	});

	test('switching back to Anime sends no description and the comic is Anime', async ({ page }) => {
		const createPage = await fillCustom(page, DESCRIPTION);
		await tabTo(page, createPage.styleRadio(m.styleCustom()));
		// Custom is the last card, so ArrowLeft once per card before it reaches Anime.
		for (let presses = 0; presses < STYLE_CARDS().length - 1; presses++) {
			await page.keyboard.press('ArrowLeft');
		}
		await expect(createPage.styleRadio(m.styleAnime())).toBeChecked();
		await expect(createPage.customStyleInput).toHaveCount(0);

		const request = page.waitForRequest(
			(candidate) =>
				candidate.method() === 'POST' && candidate.url().includes(`?/${CREATE_COMIC_ACTION}`),
		);
		await createPage.submit();
		expect((await request).postData() ?? '').not.toContain(DESCRIPTION);

		await expect(page).toHaveURL(COMIC_URL);
		const id = page.url().split('/').at(-1);
		const comic = (await storedComics(page)).find((stored) => stored.id === id);
		expect(comic?.style).toBe('anime');
		expect(comic?.customStyle ?? null).toBeNull();
	});
});

test.describe('the Custom style description is validated', { tag: '@REQ-97-2' }, () => {
	const CASES = [
		{ name: 'empty', text: '', message: () => m.customStyleTooShort() },
		{ name: '9 characters', text: 'x'.repeat(9), message: () => m.customStyleTooShort() },
		{ name: '501 characters', text: 'x'.repeat(501), message: () => m.customStyleTooLong() },
		{ name: 'whitespace only', text: ' '.repeat(20), message: () => m.customStyleTooShort() },
	];
	for (const { name, text, message } of CASES) {
		test(`${name} shows a field error and sends no create request`, async ({ page }) => {
			const requests: string[] = [];
			page.on('request', (request) => {
				if (request.method() === 'POST' && request.url().includes('?/')) {
					requests.push(request.url());
				}
			});
			const createPage = await fillCustom(page, text);
			// Let the server's rules answer, not the browser's.
			await page.locator('form[action$="create-comic"]').evaluate((form) => {
				form.setAttribute('novalidate', '');
			});
			await createPage.submit();

			await expect(page.getByText(message(), { exact: true })).toBeVisible();
			await expect(createPage.customStyleInput).toHaveAccessibleDescription(
				new RegExp(message().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
			);
			await expect(page).toHaveURL(/\/comic\/create$/);
			expect(requests).toEqual([]);
		});
	}

	test('10 and 500 characters are accepted', async ({ page }) => {
		const createPage = await fillCustom(page, 'x'.repeat(10));
		await createPage.submit();
		await expect(page).toHaveURL(COMIC_URL);

		await fillCustom(page, 'y'.repeat(500)).then((create) => create.submit());
		await expect(page).toHaveURL(COMIC_URL);
	});
});

test.describe('the Custom style reaches every generation', { tag: '@REQ-97-3' }, () => {
	test('is stored on the comic', async ({ page }) => {
		const id = await createCustomComic(page);
		const stored = (await storedComics(page)).find((comic) => comic.id === id);

		expect(stored?.style).toBe('custom');
		expect(stored?.customStyle).toBe(DESCRIPTION);
		// Old comics (no customStyle) and new ones both load.
		expect(ComicSchema.safeParse(stored).success).toBe(true);
	});

	test('a marker in the description reaches the create-comic prompt', async ({ page }) => {
		const createPage = await fillCustom(page, 'Loose ink, mock-error:upstream');
		await createPage.submit();

		await expect(errorRegion(page)).toBeVisible();
		await expect(page).toHaveURL(/\/comic\/create$/);
	});

	test('the panel image and cover requests carry it and use it in the prompt', async ({ page }) => {
		const id = await createCustomComic(page);
		const [{ id: panelId }] = (
			(await storedComics(page)).find((comic) => comic.id === id) as {
				panels: { id: string }[];
			}
		).panels;

		// Panel image.
		await gotoHydrated(page, `/comic/${id}/${panelId}`);
		const imageRequest = page.waitForRequest(
			(request) =>
				request.method() === 'POST' && request.url().includes(`?/${CREATE_PANEL_IMAGE_ACTION}`),
		);
		await activate(page, page.getByRole('button', { name: m.addImage() }));
		expect((await imageRequest).postData() ?? '').toContain(DESCRIPTION);
		await expect(page.getByRole('img', { name: 'mock alt text' }).first()).toBeVisible();

		// Cover: remove the made one so "Add Cover" shows.
		await gotoHydrated(page, `/comic/${id}`);
		await activate(page, page.getByRole('button', { name: m.removeLandscapeCover(), exact: true }));
		await activate(page, page.getByRole('button', { name: m.deleteCover(), exact: true }));
		const coverRequest = page.waitForRequest(
			(request) =>
				request.method() === 'POST' && request.url().includes(`?/${CREATE_COVER_IMAGE_ACTION}`),
		);
		await activate(page, page.getByRole('button', { name: m.addCover(), exact: true }));
		// The cover form posts URL-encoded (spaces as '+'), so compare decoded values.
		expect([...new URLSearchParams((await coverRequest).postData() ?? '').values()]).toContain(
			DESCRIPTION,
		);

		// Later requests use the stored description in the prompt: put the marker in it.
		await page.evaluate((marker) => {
			const db = JSON.parse(localStorage.getItem('comics_db') ?? '{}');
			for (const comic of db.comics) {
				if (comic.style === 'custom') {
					comic.customStyle = `${comic.customStyle} ${marker}`;
				}
			}
			localStorage.setItem('comics_db', JSON.stringify(db));
		}, 'mock-error:upstream');
		await gotoHydrated(page, `/comic/${id}/${panelId}`);
		await activate(page, page.getByRole('button', { name: m.generateNewImage() }));
		await expect(errorRegion(page)).toBeVisible();

		await gotoHydrated(page, `/comic/${id}`);
		await activate(page, page.getByRole('button', { name: m.addCover(), exact: true }));
		await expect(errorRegion(page)).toBeVisible();
	});
});

test(
	'a custom comic shows Custom on its card and in Comic settings with the description',
	{ tag: ['@REQ-97-4', '@REQ-295-1'] },
	async ({ page }) => {
		const id = await createCustomComic(page);
		const stored = ComicSchema.parse((await storedComics(page)).find((comic) => comic.id === id));

		const settings = page
			.getByRole('heading', { name: m.comicSettings(), exact: true })
			.locator('xpath=ancestor::*[self::section or self::div][1]');
		const style = page.locator('dt', { hasText: m.comicStyle() }).locator('+ dd');
		await expect(style).toHaveText(new RegExp(`^\\s*${m.styleCustom()}`));
		await expect(settings.getByText(DESCRIPTION, { exact: true })).toBeVisible();
		await expect(page.getByRole('textbox', { name: m.customStyleLabel() })).toHaveCount(0);

		const landingPage = await new LandingPage(page).goto();
		await expect(
			landingPage.card(stored.title).getByText(metaLine(stored, false), { exact: true }),
		).toBeVisible();
		await expect(landingPage.card(stored.title)).toContainText(m.styleCustom());
	},
);
