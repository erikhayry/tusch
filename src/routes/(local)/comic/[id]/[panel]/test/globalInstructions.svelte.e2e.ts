import { m } from '$lib/paraglide/messages';
import { expect, test } from '@playwright/test';
import { gotoHydrated } from '../../../../../../tests/e2e/gotoHydrated';
import {
	RATE_LIMIT_MARKER,
	RATE_LIMIT_MESSAGE,
	createComicThroughUi,
	saveGlobalInstructions,
} from '../../../../../../tests/e2e/globalInstructions';
import { activate } from '../../../../../../tests/e2e/keyboard';

test('global instructions reach the panel image prompt', { tag: '@REQ-045' }, async ({ page }) => {
	const { comicId, panelId } = await createComicThroughUi(page);
	await saveGlobalInstructions(page, RATE_LIMIT_MARKER);

	await gotoHydrated(page, `/comic/${comicId}/${panelId}`);
	await activate(page, page.getByRole('button', { name: m.addImage() }));

	await expect(page.getByTestId('error-test-id')).toContainText(RATE_LIMIT_MESSAGE);
	await expect(page.getByRole('button', { name: m.addImage() })).toBeVisible();
	await expect(page.getByRole('button', { name: m.removeImage() })).toBeHidden();
});

test('global instructions reach the insert panel prompt', { tag: '@REQ-045' }, async ({ page }) => {
	const { comicId, panelId } = await createComicThroughUi(page);
	await saveGlobalInstructions(page, RATE_LIMIT_MARKER);

	await gotoHydrated(page, `/comic/${comicId}/${panelId}`);
	const panels = page.getByRole('list', { name: m.panels() }).getByRole('listitem');
	const before = await panels.count();
	await activate(page, page.getByRole('button', { name: m.addPanelBefore({ number: 1 }) }));

	await expect(page.getByTestId('error-test-id')).toContainText(RATE_LIMIT_MESSAGE);
	await expect(panels).toHaveCount(before);
});
