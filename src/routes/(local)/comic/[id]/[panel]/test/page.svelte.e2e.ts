import { m } from '$lib/paraglide/messages';
import { expect, test } from '@playwright/test';
import { EXAMPLE_COMPLETE } from '../../../../../../tests/e2e/examples';
import {
	createComic,
	currentImagePreview,
	expectValidPreviewSize,
	generatePanelImage,
	storedComic,
} from '../../../../../../tests/e2e/createdComic';
import { PanelPage } from './utils/panelPage';

test('panel image preview has valid size attributes', { tag: '@REQ-172-1' }, async ({ page }) => {
	const comicId = await createComic(page);
	const [panel] = (await storedComic(page, comicId)).panels;
	await generatePanelImage(page, comicId, panel.id);
	await gotoHydrated(page, `/comic/${comicId}/${panel.id}`);

	await expectValidPreviewSize(currentImagePreview(page));
});
import { gotoHydrated } from '../../../../../../tests/e2e/gotoHydrated';
import { activate, typeInto } from '../../../../../../tests/e2e/keyboard';

test('creates image', { tag: '@REQ-015' }, async ({ page }) => {
	const panelPage = await new PanelPage(page).goto();

	await activate(page, panelPage.deleteImageButton);

	await panelPage.createImageButton.waitFor({ state: 'visible' });

	await activate(page, panelPage.createImageButton);

	await expect(panelPage.newImage).toBeVisible();
});

test('replace image', { tag: '@REQ-016' }, async ({ page }) => {
	const panelPage = await new PanelPage(page).goto();

	await activate(page, panelPage.replaceImageButton);

	await expect(panelPage.newImage).toBeVisible();
});

test('removes image', { tag: '@REQ-017' }, async ({ page }) => {
	const panelPage = await new PanelPage(page).goto(1);

	await activate(page, panelPage.deleteImageButton);

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

	await expect(page.getByText(EXAMPLE_COMPLETE.panels[1].captions[0])).toBeHidden();
});

test('edit dialogue', { tag: '@REQ-020' }, async ({ page }) => {
	const panelPage = await new PanelPage(page).goto();

	await panelPage.editDialogue('NEW DIALOGUE');

	await expect(page.getByText('NEW DIALOGUE')).toBeVisible();
});

test('remove dialogue', { tag: '@REQ-020' }, async ({ page }) => {
	const panelPage = await new PanelPage(page).goto(1);

	await panelPage.removeDialogue();

	await expect(page.getByText(EXAMPLE_COMPLETE.panels[1].dialogue[0].text)).toBeHidden();
});

test('add panel before', { tag: '@REQ-021' }, async ({ page }) => {
	const panelPage = await new PanelPage(page).goto();

	await panelPage.addPanelBefore();

	expect(await panelPage.numberOfPanels()).toBe(panelPage.initialNumberOfPanels + 1);
});

//Works, fix test data
test(
	'shows character crops next to dialogue after generating a panel image',
	{ tag: '@REQ-018' },
	async ({ page }) => {
		const panelPage = await new PanelPage(page).goto();
		await expect(panelPage.dialogueCharacterImage).toHaveCount(0);

		await activate(page, panelPage.deleteImageButton);
		await activate(page, panelPage.createImageButton);
		await expect(panelPage.newImage).toBeVisible();

		// One head crop per dialogue line whose character appears in the new image.
		await expect(panelPage.dialogueCharacterImage).toHaveCount(
			EXAMPLE_COMPLETE.panels[0].dialogue.length,
		);
		await page.reload();
		await expect(panelPage.dialogueCharacterImage).toHaveCount(
			EXAMPLE_COMPLETE.panels[0].dialogue.length,
		);
	},
);

test('add caption', { tag: ['@REQ-019', '@REQ-022'] }, async ({ page }) => {
	await gotoHydrated(page, `/comic/${EXAMPLE_COMPLETE.id}/${EXAMPLE_COMPLETE.panels[0].id}`);
	const captions = page.getByRole('list', { name: m.captions() }).getByRole('listitem');
	const before = await captions.count();

	await typeInto(page, page.getByRole('textbox', { name: m.newCaption() }), 'A NEW CAPTION');
	await activate(page, page.getByRole('button', { name: m.addCaption() }));

	await expect(captions).toHaveCount(before + 1);
	await expect(captions.last()).toContainText('A NEW CAPTION');
	await expect(page.getByRole('textbox', { name: m.newCaption() })).toHaveValue('');

	await page.reload();
	await expect(captions.last()).toContainText('A NEW CAPTION');
});
