import { m } from '$lib/paraglide/messages';
import { expect, test, type Page } from '@playwright/test';
import { exampleMinimal, exampleNoImages } from '../../../../../../tests/e2e/examples';
import { gotoHydrated } from '../../../../../../tests/e2e/gotoHydrated';
import { activate } from '../../../../../../tests/e2e/keyboard';
import { PanelPage } from './utils/panelPage';

const captions = (page: Page) =>
	page.getByRole('list', { name: m.captions() }).getByRole('listitem');
const dialogue = (page: Page) =>
	page.getByRole('list', { name: m.dialogues() }).getByRole('listitem');

test(
	'example without images shows captions, dialogue and the control to generate an image',
	{ tag: ['@REQ-010', '@REQ-015'] },
	async ({ page }) => {
		const example = exampleNoImages();
		const [panel] = example.panels;
		expect(panel.image).toBeUndefined();
		await gotoHydrated(page, `/comic/${example.id}/${panel.id}`);

		await expect(captions(page)).toHaveCount(panel.captions.length);
		for (const caption of panel.captions) {
			await expect(page.getByText(caption, { exact: true })).toBeVisible();
		}
		await expect(dialogue(page)).toHaveCount(panel.dialogue.length);
		for (const line of panel.dialogue) {
			await expect(page.getByText(line.text, { exact: true })).toBeVisible();
		}
		await expect(page.getByRole('button', { name: m.addImage() })).toBeVisible();
		await expect(page.getByRole('button', { name: m.removeImage() })).toBeHidden();
		await expect(page.getByRole('img')).toHaveCount(0);
	},
);

test(
	'generating the first panel image of the no-image example shows the mock image and a character crop',
	{ tag: ['@REQ-015', '@REQ-018'] },
	async ({ page }) => {
		const example = exampleNoImages();
		const [panel] = example.panels;
		const [character] = example.characters;
		const panelPage = new PanelPage(page);
		await gotoHydrated(page, `/comic/${example.id}/${panel.id}`);

		await activate(page, panelPage.createImageButton);

		await expect(panelPage.newImage).toBeVisible();
		await expect(panelPage.dialogueCharacterImage).toHaveCount(
			panel.dialogue.filter(({ characterId }) => characterId === character.id).length,
		);

		await gotoHydrated(page, `/comic/${example.id}`);
		const entry = page
			.getByRole('heading', { name: character.name })
			.locator('xpath=following-sibling::ul[1]')
			.getByRole('listitem')
			.filter({ hasText: panel.editorialTitle });
		// The stored crop is shown in the character's gallery, so no preview is offered.
		await expect(
			entry.getByRole('button', {
				name: m.characterPreviewCrop({ name: character.name, number: 1 }),
			}),
		).toBeHidden();
		await expect(
			page.getByLabel(
				m.characterHeadAlt({ name: character.name, number: 1, title: panel.editorialTitle }),
			),
		).toBeVisible();
	},
);

test(
	'minimal example shows its one caption and one dialogue line',
	{ tag: '@REQ-010' },
	async ({ page }) => {
		const example = exampleMinimal();
		const [panel] = example.panels;
		expect(panel.captions).toHaveLength(1);
		expect(panel.dialogue).toHaveLength(1);
		await gotoHydrated(page, `/comic/${example.id}/${panel.id}`);

		await expect(captions(page)).toHaveCount(1);
		await expect(page.getByText(panel.captions[0], { exact: true })).toBeVisible();
		await expect(dialogue(page)).toHaveCount(1);
		await expect(page.getByText(panel.dialogue[0].text, { exact: true })).toBeVisible();
	},
);
