import AxeBuilder from '@axe-core/playwright';
import { m } from '$lib/paraglide/messages';
import { expect, test, type Page } from '@playwright/test';
import { gotoHydrated } from '../../../../../tests/e2e/gotoHydrated';
import { holdRequest } from '../../../../../tests/e2e/holdRequest';
import { CreatePage } from './utils/createPage';

const CREATE_COMIC_REQUEST = /\?\/create-comic/;
const ARTICLE = 'https://example.com/article';

/** The live region that announces the action; the ticking seconds must stay out of it. */
function announcement(page: Page, text: string) {
	return page.getByRole('status').filter({ hasText: text });
}

const anyTimer = (page: Page) => page.getByText(/^\d+ s$/);

test('the loader names the create comic action', { tag: ['@REQ-041'] }, async ({ page }) => {
	const createPage = await new CreatePage(page).goto();
	const release = await holdRequest(page, CREATE_COMIC_REQUEST);

	await createPage.fillUrl(ARTICLE);
	await createPage.submit();

	await expect(page.getByText(m.loadingCreateComic())).toBeVisible();
	await expect(page.getByText(m.loading(), { exact: true })).toBeHidden();
	const bar = page.getByRole('progressbar');
	await expect(bar).toBeVisible();
	await expect(bar).not.toHaveAttribute('value');
	await expect(bar).toHaveAccessibleName(m.loadingCreateComic());

	release();
	await expect(page).toHaveURL(/\/comic\/[0-9a-f-]{36}$/);
});

test('the loader shows the seconds elapsed', { tag: ['@REQ-042'] }, async ({ page }) => {
	await page.clock.install();
	const createPage = await new CreatePage(page).goto();
	const release = await holdRequest(page, CREATE_COMIC_REQUEST);

	await createPage.fillUrl(ARTICLE);
	await createPage.submit();
	await expect(page.getByRole('progressbar')).toBeVisible();

	await page.clock.runFor(12_000);

	await expect(page.getByText(m.elapsedSeconds({ seconds: 12 }), { exact: true })).toBeVisible();

	release();
	await expect(page).toHaveURL(/\/comic\/[0-9a-f-]{36}$/);
});

test('the bar, label and timer are gone after success', { tag: ['@REQ-042'] }, async ({ page }) => {
	const createPage = await new CreatePage(page).goto();
	const release = await holdRequest(page, CREATE_COMIC_REQUEST);

	await createPage.fillUrl(ARTICLE);
	await createPage.submit();
	await expect(page.getByRole('progressbar')).toBeVisible();
	await expect(anyTimer(page)).toBeVisible();

	release();
	await expect(page).toHaveURL(/\/comic\/[0-9a-f-]{36}$/);

	await expect(page.getByRole('progressbar')).toBeHidden();
	await expect(page.getByText(m.loadingCreateComic())).toBeHidden();
	await expect(anyTimer(page)).toHaveCount(0);
});

test(
	'a failed submission clears the loader, shows the error and does not announce done',
	{ tag: ['@REQ-042', '@REQ-043'] },
	async ({ page }) => {
		const createPage = await new CreatePage(page).goto();
		const release = await holdRequest(page, CREATE_COMIC_REQUEST);

		await createPage.fillUrl('https://example.com/mock-error:upstream');
		await createPage.submit();
		await expect(page.getByRole('progressbar')).toBeVisible();

		release();
		await expect(createPage.error).toBeVisible();

		await expect(page.getByRole('progressbar')).toBeHidden();
		await expect(anyTimer(page)).toHaveCount(0);
		await expect(page.getByText(m.done(), { exact: true })).toHaveCount(0);
		await expect(page).toHaveURL(/\/comic\/create$/);
	},
);

test(
	'the live region announces the label, not the seconds, then done',
	{ tag: ['@REQ-043'] },
	async ({ page }) => {
		await page.clock.install();
		const createPage = await new CreatePage(page).goto();
		const release = await holdRequest(page, CREATE_COMIC_REQUEST);

		await createPage.fillUrl(ARTICLE);
		await createPage.submit();

		const running = announcement(page, m.loadingCreateComic());
		await expect(running).toHaveCount(1);
		await page.clock.runFor(5_000);
		await expect(page.getByText(m.elapsedSeconds({ seconds: 5 }), { exact: true })).toBeVisible();
		await expect(running).not.toContainText(/\d+ s/);

		release();
		await expect(page).toHaveURL(/\/comic\/[0-9a-f-]{36}$/);

		await expect(announcement(page, m.done())).toHaveCount(1);
	},
);

test(
	'a running loader passes axe and fits 320 px',
	{ tag: ['@REQ-035', '@REQ-040'] },
	async ({ page }) => {
		await page.setViewportSize({ width: 320, height: 640 });
		await gotoHydrated(page, '/comic/create');
		const createPage = new CreatePage(page);
		const release = await holdRequest(page, CREATE_COMIC_REQUEST);

		await createPage.fillUrl(ARTICLE);
		await createPage.submit();
		await expect(page.getByRole('progressbar')).toBeVisible();

		const { violations } = await new AxeBuilder({ page }).analyze();
		expect(
			violations.map(({ id, nodes }) => ({ id, nodes: nodes.map((n) => n.target.join(' ')) })),
		).toEqual([]);
		const { scrollWidth, clientWidth } = await page.evaluate(() => ({
			scrollWidth: document.documentElement.scrollWidth,
			clientWidth: document.documentElement.clientWidth,
		}));
		expect(scrollWidth).toBeLessThanOrEqual(clientWidth);

		release();
		await expect(page).toHaveURL(/\/comic\/[0-9a-f-]{36}$/);
	},
);
