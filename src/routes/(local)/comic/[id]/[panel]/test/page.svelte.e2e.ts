import { m } from '$lib/paraglide/messages';
import { expect, test } from '@playwright/test';
import { EXAMPLES } from '../../../../../../examples/examples';
import { PanelPage } from './utils/panelPage';
import { gotoHydrated } from '../../../../../../tests/e2e/gotoHydrated';

test('creates image', { tag: '@REQ-015' }, async ({ page }) => {
	const panelPage = await new PanelPage(page).goto();

	await panelPage.deleteImageButton.click();

	await panelPage.createImageButton.waitFor({ state: 'visible' });

	await panelPage.createImageButton.click();

	await expect(panelPage.newImage).toBeVisible();
});

test('replace image', { tag: '@REQ-016' }, async ({ page }) => {
	const panelPage = await new PanelPage(page).goto();

	await panelPage.replaceImageButton.click();

	await expect(panelPage.newImage).toBeVisible();
});

test('removes image', { tag: '@REQ-017' }, async ({ page }) => {
	const panelPage = await new PanelPage(page).goto(1);

	await panelPage.deleteImageButton.click();

	await expect(panelPage.initialImage).toBeHidden();
});

test('edit caption', { tag: '@REQ-019' }, async ({ page }) => {
	const panelPage = await new PanelPage(page).goto();

	await panelPage.editCaption('NEW CAPTION');

	await expect(page.getByText('NEW CAPTION', { exact: true })).toBeVisible();
});

test('remove caption', { tag: '@REQ-019' }, async ({ page }) => {
	const panelPage = await new PanelPage(page).goto(1);

	await panelPage.removeCaption();

	await expect(page.getByText(EXAMPLES[0].panels[1].captions[0])).toBeHidden();
});

test('edit dialogue', { tag: '@REQ-020' }, async ({ page }) => {
	const panelPage = await new PanelPage(page).goto();

	await panelPage.editDialogue('NEW DIALOGUE');

	await expect(page.getByText('NEW DIALOGUE')).toBeVisible();
});

test('remove dialogue', { tag: '@REQ-020' }, async ({ page }) => {
	const panelPage = await new PanelPage(page).goto(1);

	await panelPage.removeDialogue();

	await expect(page.getByText(EXAMPLES[0].panels[1].dialogue[0].text)).toBeHidden();
});

test('add panel before', { tag: '@REQ-021' }, async ({ page }) => {
	const panelPage = await new PanelPage(page).goto();

	await panelPage.addPanelBefore();

	expect(await panelPage.numberOfPanels()).toBe(panelPage.initialNumberOfPanels + 1);
});

//Works, fix test data
test.skip('show character image next to dialogue', async ({ page }) => {
	const panelPage = await new PanelPage(page).goto();

	await panelPage.deleteImageButton.click();
	await panelPage.createImageButton.waitFor({ state: 'visible' });
	await panelPage.createImageButton.click();
	await panelPage.newImage.waitFor({ state: 'visible' });

	await expect(panelPage.dialogueCharacterImage).toBeVisible();
});

test('add caption', { tag: ['@REQ-019', '@REQ-022'] }, async ({ page }) => {
	await gotoHydrated(page, `/comic/${EXAMPLES[0].id}/${EXAMPLES[0].panels[0].id}`);
	const captions = page.getByRole('list', { name: m.captions() }).getByRole('listitem');
	const before = await captions.count();

	await page.getByRole('textbox', { name: m.newCaption() }).fill('A NEW CAPTION');
	await page.getByRole('button', { name: m.addCaption() }).click();

	await expect(captions).toHaveCount(before + 1);
	await expect(captions.last()).toContainText('A NEW CAPTION');
	await expect(page.getByRole('textbox', { name: m.newCaption() })).toHaveValue('');

	await page.reload();
	await expect(captions.last()).toContainText('A NEW CAPTION');
});
