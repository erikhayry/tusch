import { expect, test } from '@playwright/test';
import { EXAMPLES } from '../../../../../examples/examples';
import { PanelPage } from './utils/panelPage';

test.beforeEach(async ({ request }) => {
	await request.post('/api/test/seed');
});

test('creates image', async ({ page }) => {
	const panelPage = new PanelPage(page).goto();

	await panelPage.deleteImageButton.click();

	await panelPage.createImageButton.waitFor({ state: 'visible' });

	await panelPage.createImageButton.click();

	await expect(panelPage.mockedImage).toBeVisible();
});

test('replace image', async ({ page }) => {
	const panelPage = new PanelPage(page).goto();

	await panelPage.replaceImageButton.click();

	await expect(panelPage.mockedImage).toBeVisible();
});

test('removes image', async ({ page }) => {
	const panelPage = new PanelPage(page).goto(1);

	await panelPage.deleteImageButton.click();

	await expect(panelPage.image).toBeHidden();
});

test('edit caption', async ({ page }) => {
	const panelPage = new PanelPage(page).goto();

	await panelPage.editCaption('NEW CAPTION');

	await expect(page.getByText('NEW CAPTION')).toBeVisible();
});

test('remove caption', async ({ page }) => {
	const panelPage = new PanelPage(page).goto(1);

	await panelPage.removeCaption();

	await expect(page.getByText(EXAMPLES[0].panels[1].captions[0])).toBeHidden();
});

test('edit dialogue', async ({ page }) => {
	const panelPage = new PanelPage(page).goto();

	await panelPage.editDialogue('NEW DIALOGUE');

	await expect(page.getByText('NEW DIALOGUE')).toBeVisible();
});

test('remove dialogue', async ({ page }) => {
	const panelPage = new PanelPage(page).goto(1);

	await panelPage.removeDialogue();

	await expect(page.getByText(EXAMPLES[0].panels[1].dialogue[0].text)).toBeHidden();
});

test('add panel before', async ({ page }) => {
	const panelPage = new PanelPage(page).goto();

	await panelPage.addPanelBefore();

	expect(await panelPage.numberOfPanels()).toBe(panelPage.initialNumberOfPanels + 1);
});
