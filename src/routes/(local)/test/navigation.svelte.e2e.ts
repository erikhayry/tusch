import { m } from '$lib/paraglide/messages';
import { expect, test, type Page } from '@playwright/test';
import { EXAMPLE_COMPLETE as EXAMPLE } from '../../../tests/e2e/examples';
import { gotoHydrated } from '../../../tests/e2e/gotoHydrated';
import { activate, typeInto } from '../../../tests/e2e/keyboard';

const MISSING_ID = '00000000-0000-4000-8000-000000000000';

async function storedComics(page: Page): Promise<{ id: string; panels: { id: string }[] }[]> {
	return page.evaluate(
		() => JSON.parse(localStorage.getItem('comics_db') ?? '{"comics":[]}').comics,
	);
}

/** Create a comic through the UI (mock AI) and return it as stored locally. */
async function createComic(page: Page) {
	await gotoHydrated(page, '/comic/create');
	await typeInto(page, page.getByRole('textbox', { name: /url/i }), 'https://example.com/article');
	await activate(page, page.getByRole('button', { name: /submit/i }));
	await expect(page).toHaveURL(/\/comic\/[0-9a-f-]{36}$/);

	const id = page.url().split('/').at(-1)!;
	const comic = (await storedComics(page)).find((stored) => stored.id === id);
	if (!comic) throw new Error('created comic was not persisted');
	return comic;
}

test.describe('direct navigation', () => {
	test('opens an existing comic', { tag: '@REQ-023' }, async ({ page }) => {
		await gotoHydrated(page, `/comic/${EXAMPLE.id}`);

		await expect(page.getByRole('heading', { name: EXAMPLE.title, level: 2 })).toBeVisible();
	});

	test('shows not found for a missing comic', { tag: '@REQ-024' }, async ({ page }) => {
		await gotoHydrated(page, `/comic/${MISSING_ID}`);

		await expect(page.getByRole('heading', { name: '404' })).toBeVisible();
		await expect(page.getByText('Comic not found')).toBeVisible();
	});

	test('shows not found for a missing panel', { tag: '@REQ-024' }, async ({ page }) => {
		await gotoHydrated(page, `/comic/${EXAMPLE.id}/${MISSING_ID}`);

		await expect(page.getByRole('heading', { name: '404' })).toBeVisible();
		await expect(page.getByText('Panel not found')).toBeVisible();
	});

	test(
		'shows not found for a panel that belongs to another comic',
		{ tag: '@REQ-024' },
		async ({ page }) => {
			const created = await createComic(page);

			await gotoHydrated(page, `/comic/${created.id}/${EXAMPLE.panels[0].id}`);

			await expect(page.getByText('Panel not found')).toBeVisible();
		},
	);

	test(
		'reloads a newly created comic and opens its panels directly',
		{ tag: ['@REQ-022', '@REQ-023'] },
		async ({ page }) => {
			const created = await createComic(page);

			await page.reload();
			await expect(page.getByRole('heading', { name: /^Comic:/, level: 1 })).toBeVisible();

			// Previously server-rendered: a locally created panel 404'd on direct load.
			await gotoHydrated(page, `/comic/${created.id}/${created.panels[0].id}`);
			await expect(
				page.getByRole('heading', { name: m.panel({ number: 1 }), level: 1 }),
			).toBeVisible();
		},
	);
});
