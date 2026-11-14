import { m } from '$lib/paraglide/messages';
import { getImageFromOpenAiResponse } from '$lib/utils/ai/ai';
import { expect, test, type Page } from '@playwright/test';
import { EXAMPLE_COMPLETE } from '../../../../../tests/e2e/examples';
import { storedComics } from '../../../../../tests/e2e/storage';
import { CREATE_COVER_IMAGE_RESPONSE } from '../../../../../tests/mock/openAi/openAiResponse';
import { CreatePage } from './utils/createPage';
import { gotoHydrated } from '../../../../../tests/e2e/gotoHydrated';

const STORY_FIRST_LINE = 'A lighthouse keeper finds a message in a bottle.';
const STORY = `${STORY_FIRST_LINE}\nIt leads her to a hidden cove.`;
const SOURCE_URL = 'https://example.com/article';
const MOCK_TITLE = 'Ådalshändelserna: Vägen till Lunde';
const COMIC_URL = /\/comic\/[0-9a-f-]{36}$/;

test('has expected title', { tag: '@REQ-005' }, async ({ page }) => {
	const createPage = await new CreatePage(page).goto();

	await expect(createPage.heading).toBeVisible();
});

test('is redirected after submit', { tag: '@REQ-005' }, async ({ page }) => {
	const createPage = await new CreatePage(page).goto();

	await createPage.fillUrl('https://sv.wikipedia.org/wiki/%C3%85dalsh%C3%A4ndelserna');
	await createPage.submit();

	await expect(page).toHaveURL(/\/comic\/[0-9a-f-]{36}$/);
});

test(
	'error message is displayed when submitting with invalid URL',
	{ tag: '@REQ-007' },
	async ({ page }) => {
		const createPage = await new CreatePage(page).goto();
		await createPage.fillUrl('INVALID_URL');
		await createPage.submit();

		await expect(createPage.error).toBeVisible();
	},
);

test(
	'error message is removed when submitting with valid URL',
	{ tag: '@REQ-007' },
	async ({ page }) => {
		const createPage = await new CreatePage(page).goto();
		await createPage.fillUrl('INVALID_URL');
		await createPage.submit();

		await createPage.fillUrl('https://sv.wikipedia.org/wiki/%C3%85dalsh%C3%A4ndelserna');
		await createPage.submit();

		await expect(createPage.error).toBeHidden();
	},
);

test(
	'keeps existing comics when creating from a freshly loaded create page',
	{ tag: '@REQ-008' },
	async ({ page }) => {
		await gotoHydrated(page, '/');
		await expect(page.getByRole('link', { name: EXAMPLE_COMPLETE.title })).toBeVisible();
		const before = await page.evaluate(
			() => JSON.parse(localStorage.getItem('comics_db') ?? '{"comics":[]}').comics.length,
		);

		// Full page load straight onto /comic/create, then create a comic.
		const createPage = await new CreatePage(page).goto();
		await createPage.fillUrl('https://sv.wikipedia.org/wiki/%C3%85dalsh%C3%A4ndelserna');
		await createPage.submit();
		await expect(page).toHaveURL(/\/comic\/[0-9a-f-]{36}$/);

		const after = await page.evaluate(
			() => JSON.parse(localStorage.getItem('comics_db') ?? '{"comics":[]}').comics.length,
		);
		expect(after).toBe(before + 1);
	},
);

test.describe('provider failures', { tag: '@REQ-009' }, () => {
	for (const [kind, message] of [
		['auth', 'API key is invalid or rejected'],
		['rate-limit', 'AI provider rate limit reached, try again shortly'],
		['upstream', 'AI provider request failed (HTTP 500): boom'],
	] as const) {
		test(`shows a readable message for ${kind} failures`, async ({ page }) => {
			const createPage = await new CreatePage(page).goto();

			await createPage.fillUrl(`https://example.com/mock-error:${kind}`);
			await createPage.submit();

			await expect(createPage.error).toContainText(message);
			await expect(createPage.error).not.toContainText('{');
			await expect(createPage.error).not.toContainText('Internal Error');
			await expect(page).toHaveURL(/\/comic\/create$/);
		});
	}
});

test('a new comic gets a generated cover', { tag: '@REQ-006' }, async ({ page }) => {
	const createPage = await new CreatePage(page).goto();

	await createPage.fillUrl('https://example.com/article');
	await createPage.submit();

	await expect(page).toHaveURL(/\/comic\/[0-9a-f-]{36}$/);
	await expect(
		page.getByRole('img', { name: getImageFromOpenAiResponse(CREATE_COVER_IMAGE_RESPONSE).alt }),
	).toBeVisible();
});

test(
	'shows progress and ignores a second submit while a request runs',
	{ tag: '@REQ-032' },
	async ({ page }) => {
		const createPage = await new CreatePage(page).goto();
		let posts = 0;
		await page.route('**/comic/create?/create-comic', async (route) => {
			posts += 1;
			await new Promise((resolve) => setTimeout(resolve, 1500));
			await route.continue();
		});

		await createPage.fillUrl('https://example.com/article');
		await createPage.submit();
		await expect(page.getByTestId('loader-test-id')).toContainText(m.loadingCreateComic());
		await createPage.submit();

		await expect(page).toHaveURL(/\/comic\/[0-9a-f-]{36}$/);
		await expect(page.getByTestId('loader-test-id')).toHaveText('');
		expect(posts).toBe(1);
	},
);

test('creates a comic from a story only', { tag: '@REQ-005' }, async ({ page }) => {
	const createPage = await new CreatePage(page).goto();

	await createPage.pasteStory(STORY);
	await createPage.submit();

	await expect(page).toHaveURL(COMIC_URL);
	await expect(page.getByRole('heading', { name: MOCK_TITLE })).toBeVisible();
	await expect(page.locator('ul[aria-labelledby="panels"] > li').first()).toBeVisible();
});

test(
	'creates a comic from a URL and a story and shows both',
	{ tag: ['@REQ-005', '@REQ-105-1'] },
	async ({ page }) => {
		const createPage = await new CreatePage(page).goto();

		await createPage.fillUrl(SOURCE_URL);
		await createPage.pasteStory(STORY);
		await createPage.submit();

		await expect(page).toHaveURL(COMIC_URL);
		await expect(page.getByRole('link', { name: SOURCE_URL })).toBeVisible();
		await expect(page.getByText(STORY_FIRST_LINE)).toBeVisible();
	},
);

test('a URL-only comic shows the link and no story', { tag: '@REQ-005' }, async ({ page }) => {
	const createPage = await new CreatePage(page).goto();

	await createPage.fillUrl(SOURCE_URL);
	await createPage.submit();

	await expect(page).toHaveURL(COMIC_URL);
	await expect(page.getByRole('link', { name: SOURCE_URL })).toBeVisible();
	const comics = await storedComics(page);
	expect(comics.find((comic) => comic.source === SOURCE_URL)).not.toHaveProperty('story');
});

test.describe('rejected input creates nothing', { tag: '@REQ-007' }, () => {
	const cases: [string, string | undefined][] = [
		['neither a URL nor a story', undefined],
		['a story shorter than 20 characters', 'Too short story'],
		['a story longer than 10,000 characters', 'x'.repeat(10_001)],
	];

	for (const [name, story] of cases) {
		test(`shows an error for ${name}`, async ({ page }) => {
			const createPage = await new CreatePage(page).goto();
			const before = (await storedComics(page)).length;

			if (story !== undefined) await createPage.pasteStory(story);
			await createPage.submit();

			await expect(createPage.error).toBeVisible();
			await expect(createPage.error).not.toContainText('{');
			await expect(createPage.error).not.toContainText('Internal Error');
			await expect(page).toHaveURL(/\/comic\/create$/);
			expect((await storedComics(page)).length).toBe(before);
		});
	}
});

test.describe('a story-only comic', { tag: '@REQ-105-1' }, () => {
	async function createStoryComic(page: Page) {
		const createPage = await new CreatePage(page).goto();
		await createPage.pasteStory(STORY);
		await createPage.submit();
		await expect(page).toHaveURL(COMIC_URL);
	}

	test('keeps its story after a reload and has no source link', async ({ page }) => {
		await createStoryComic(page);

		await page.reload();

		await expect(page.getByRole('heading', { name: m.source() })).toBeVisible();
		await expect(page.getByText(STORY_FIRST_LINE)).toBeVisible();
		await expect(page.getByRole('link', { name: /^https?:\/\// })).toHaveCount(0);
	});

	test('shows the story and no source in the raw view', { tag: '@REQ-027' }, async ({ page }) => {
		await createStoryComic(page);

		await gotoHydrated(page, `${new URL(page.url()).pathname}/raw`);

		const raw = JSON.parse(await page.getByRole('textbox').inputValue());
		expect(raw.story).toBe(STORY);
		expect(raw).not.toHaveProperty('source');
	});
});

test(
	'comics stored before stories existed load normally and show their link',
	{ tag: ['@REQ-026', '@REQ-105-1'] },
	async ({ page }) => {
		const legacy = {
			...EXAMPLE_COMPLETE,
			id: '6f1c2d3e-4b5a-4c7d-8e9f-0a1b2c3d4e5f',
			source: 'https://example.com/old',
		};
		await page.addInitScript((comic) => {
			if (sessionStorage.getItem('seeded-legacy')) return;
			sessionStorage.setItem('seeded-legacy', '1');
			localStorage.setItem('comics_db', JSON.stringify({ version: 1, comics: [comic] }));
		}, legacy);

		await gotoHydrated(page, `/comic/${legacy.id}`);

		await expect(page.getByRole('link', { name: legacy.source })).toBeVisible();
		expect(await page.evaluate(() => localStorage.getItem('comics_db_invalid'))).toBeNull();
	},
);
