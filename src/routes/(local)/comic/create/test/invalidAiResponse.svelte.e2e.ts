import { m } from '$lib/paraglide/messages';
import { expect, test } from '@playwright/test';
import {
	expectFriendlyAiError,
	INVALID_TEXT,
	openDetails,
} from '../../../../../tests/e2e/aiFailures';
import { storedComics } from '../../../../../tests/e2e/storage';
import { CreatePage } from './utils/createPage';

test(
	'shows a friendly message and creates nothing when the text response is invalid',
	{ tag: ['@REQ-185-2', '@REQ-009'] },
	async ({ page }) => {
		const createPage = await new CreatePage(page).goto();
		const before = (await storedComics(page)).length;

		await createPage.fillUrl(`https://example.com/${INVALID_TEXT}`);
		await createPage.submit();

		await expectFriendlyAiError(page, m.aiInvalidResponse());
		await openDetails(page);
		await expect(page).toHaveURL(/\/comic\/create$/);
		expect((await storedComics(page)).length).toBe(before);
	},
);
