import { expect, test } from '@playwright/test';
import {
	RATE_LIMIT_MARKER,
	RATE_LIMIT_MESSAGE,
	saveGlobalInstructions,
	storedComicCount,
} from '../../../../../tests/e2e/globalInstructions';
import { CreatePage } from './utils/createPage';

test(
	'global instructions reach the create comic prompt',
	{ tag: ['@REQ-045', '@REQ-009'] },
	async ({ page }) => {
		await saveGlobalInstructions(page, RATE_LIMIT_MARKER);
		const before = await storedComicCount(page);
		const createPage = await new CreatePage(page).goto();

		await createPage.fillUrl('https://example.com/article');
		await createPage.submit();

		await expect(createPage.error).toContainText(RATE_LIMIT_MESSAGE);
		await expect(page).toHaveURL(/\/comic\/create$/);
		expect(await storedComicCount(page)).toBe(before);
	},
);

test(
	'creates a comic as usual with harmless global instructions',
	{ tag: '@REQ-045' },
	async ({ page }) => {
		await saveGlobalInstructions(page, 'Keep it short');
		const createPage = await new CreatePage(page).goto();

		await createPage.fillUrl('https://example.com/article');
		await createPage.submit();

		await expect(page).toHaveURL(/\/comic\/[0-9a-f-]{36}$/);
	},
);
