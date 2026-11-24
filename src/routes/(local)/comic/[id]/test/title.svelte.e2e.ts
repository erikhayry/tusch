import AxeBuilder from '@axe-core/playwright';
import { m } from '#lib/paraglide/messages.js';
import { expect, test, type Page } from '@playwright/test';
import { storedComics } from '../../../../../tests/e2e/storage';
import { CreatePage } from '../../create/test/utils/createPage';

const ARTICLE = 'https://example.com/article';
const EMPTY_TITLE = 'mock-error:empty-title';

/** Create a comic through the UI (mock AI) and open its page; returns the stored title. */
async function createComic(page: Page, url: string): Promise<string> {
	const createPage = await new CreatePage(page).goto();
	await createPage.fillUrl(url);
	await createPage.submit();
	await expect(page).toHaveURL(/\/comic\/[0-9a-f-]{36}$/);

	const stored = (await storedComics(page)).find(({ id }) => page.url().endsWith(`/${id}`));
	return String(stored?.title);
}

test.describe('comic title', () => {
	test(
		'the comic title is the only h1 and is not repeated',
		{ tag: ['@REQ-236-1', '@REQ-010'] },
		async ({ page }) => {
			const title = await createComic(page, ARTICLE);
			expect(title).not.toBe('');

			await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
			await expect(page.getByRole('heading', { name: title, level: 1, exact: true })).toBeVisible();
			await expect(page.getByRole('heading', { name: title })).toHaveCount(1);
		},
	);

	test('the document title is the comic title', { tag: '@REQ-236-1' }, async ({ page }) => {
		const title = await createComic(page, ARTICLE);

		await expect(page).toHaveTitle(`${title} · Tusch`);
	});

	test(
		'an empty title falls back to "Untitled comic"',
		{ tag: ['@REQ-236-3', '@REQ-035'] },
		async ({ page }) => {
			const title = await createComic(page, `${ARTICLE}/${EMPTY_TITLE}`);
			expect(title).toBe('');

			await expect(
				page.getByRole('heading', { name: m.untitledComic(), level: 1, exact: true }),
			).toBeVisible();
			await expect(page).toHaveTitle(`${m.untitledComic()} · Tusch`);

			const { violations } = await new AxeBuilder({ page }).analyze();
			expect(violations.map(({ id }) => id)).not.toContain('empty-heading');
		},
	);
});
