import { m } from '$lib/paraglide/messages';
import { expect, test } from '@playwright/test';
import { gotoHydrated } from '../../../../../tests/e2e/gotoHydrated';
import {
	RATE_LIMIT_MARKER,
	RATE_LIMIT_MESSAGE,
	createComicThroughUi,
	saveGlobalInstructions,
} from '../../../../../tests/e2e/globalInstructions';
import { activate } from '../../../../../tests/e2e/keyboard';

test('global instructions reach the cover prompt', { tag: '@REQ-045' }, async ({ page }) => {
	// A comic the user made, without a cover so "Add Cover" is offered.
	const { comicId } = await createComicThroughUi(page);
	await activate(page, page.getByRole('button', { name: m.deleteCover() }));
	await expect(page.getByRole('button', { name: m.addCover() })).toBeVisible();
	await saveGlobalInstructions(page, RATE_LIMIT_MARKER);

	await gotoHydrated(page, `/comic/${comicId}`);
	await activate(page, page.getByRole('button', { name: m.addCover() }));

	await expect(page.getByTestId('error-test-id')).toContainText(RATE_LIMIT_MESSAGE);
	await expect(page.getByRole('button', { name: m.addCover() })).toBeVisible();
	await expect(page.getByRole('button', { name: m.deleteCover() })).toBeHidden();
});
