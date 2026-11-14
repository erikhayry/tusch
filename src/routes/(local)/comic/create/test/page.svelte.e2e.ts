import { m } from '$lib/paraglide/messages';
import { getImageFromOpenAiResponse } from '$lib/utils/ai/ai';
import { expect, test } from '@playwright/test';
import { EXAMPLE_COMPLETE } from '../../../../../tests/e2e/examples';
import { CREATE_COVER_IMAGE_RESPONSE } from '../../../../../tests/mock/openAi/openAiResponse';
import { CreatePage } from './utils/createPage';
import { gotoHydrated } from '../../../../../tests/e2e/gotoHydrated';

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
