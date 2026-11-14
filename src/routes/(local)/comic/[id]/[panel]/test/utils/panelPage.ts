import { m } from '$lib/paraglide/messages';
import { getImageFromOpenAiResponse } from '$lib/utils/ai/ai';
import { expect, type Locator, type Page } from '@playwright/test';
import { EXAMPLE_COMPLETE } from '../../../../../../../tests/e2e/examples';
import { CREATE_PANEL_IMAGE_RESPONSE } from '../../../../../../../tests/mock/openAi/openAiResponse';
import { gotoHydrated } from '../../../../../../../tests/e2e/gotoHydrated';
import { activate, typeInto } from '../../../../../../../tests/e2e/keyboard';

export class PanelPage {
	readonly page: Page;
	readonly deleteImageButton: Locator;
	readonly initialImage: Locator;
	readonly newImage: Locator;
	readonly editCaptionButton: Locator;
	readonly editCaptionInput: Locator;
	readonly saveCaptionButton: Locator;
	readonly deleteCaptionButton: Locator;
	readonly editDialogueInput: Locator;
	readonly editDialogueButton: Locator;
	readonly saveDialogueButton: Locator;
	readonly deleteDialogueButton: Locator;
	readonly createImageButton: Locator;
	readonly replaceImageButton: Locator;
	readonly restoreImageButton: Locator;
	readonly initialNumberOfPanels: number;
	readonly numberOfPanels: () => Promise<number>;
	readonly addPanelBeforeButton: Locator;
	readonly dialogueCharacterImage: Locator;

	constructor(page: Page) {
		this.page = page;
		this.createImageButton = page.getByRole('button', { name: m.addImage() });
		this.deleteImageButton = page.getByRole('button', { name: m.removeImage() });
		this.replaceImageButton = page.getByRole('button', { name: m.generateNewImage() });
		this.restoreImageButton = page.getByRole('button', { name: m.restorePreviousImage() });
		this.initialImage = page.getByRole('img', { name: EXAMPLE_COMPLETE.panels[0].image?.alt });
		this.newImage = page.getByRole('img', {
			name: getImageFromOpenAiResponse(CREATE_PANEL_IMAGE_RESPONSE).alt,
		});
		this.addPanelBeforeButton = page.getByRole('button', { name: m.addPanelBefore({ number: 2 }) });
		this.initialNumberOfPanels = EXAMPLE_COMPLETE.panels.length;
		this.numberOfPanels = async () =>
			page.getByRole('list', { name: m.panels() }).getByRole('listitem').count();

		this.editCaptionButton = page.getByRole('button', { name: m.editCaption({ number: 1 }) });
		this.editCaptionInput = page.getByRole('textbox', { name: m.editCaption({ number: 1 }) });
		this.saveCaptionButton = page.getByRole('button', { name: m.saveCaption({ number: 1 }) });
		this.deleteCaptionButton = page.getByRole('button', { name: m.deleteCaption({ number: 1 }) });

		this.editDialogueButton = page.getByRole('button', { name: m.editDialogue({ number: 1 }) });
		this.editDialogueInput = page.getByRole('textbox', { name: m.editDialogue({ number: 1 }) });
		this.saveDialogueButton = page.getByRole('button', { name: m.saveDialogue({ number: 1 }) });
		this.deleteDialogueButton = page.getByRole('button', { name: m.deleteDialogue({ number: 1 }) });

		this.dialogueCharacterImage = page
			.getByRole('list', { name: m.dialogues() })
			.getByRole('img', { name: 'charachter' });
	}

	/** Object URLs hide which OPFS file an <img> shows; record the file name behind each one. */
	static async recordImageFileNames(page: Page) {
		await page.addInitScript(() => {
			const names = new Map<string, string>();
			(window as unknown as { __urlNames: Map<string, string> }).__urlNames = names;
			const original = URL.createObjectURL.bind(URL);
			URL.createObjectURL = (obj: Blob | MediaSource) => {
				const url = original(obj);
				if (obj instanceof File) names.set(url, obj.name);
				return url;
			};
		});
	}

	/** OPFS file names behind the dialogue heads; needs `recordImageFileNames` before goto. */
	dialogueCharacterImageFileNames(): Promise<string[]> {
		return this.dialogueCharacterImage.evaluateAll((images) =>
			images.map(
				(image) =>
					(window as unknown as { __urlNames: Map<string, string> }).__urlNames.get(
						(image as HTMLImageElement).src,
					) ?? '',
			),
		);
	}

	async removeCaption() {
		await activate(this.page, this.deleteCaptionButton);
	}

	async editCaption(newCaption: string) {
		await activate(this.page, this.editCaptionButton);
		await typeInto(this.page, this.editCaptionInput, newCaption);
		await activate(this.page, this.saveCaptionButton);
	}

	async removeDialogue() {
		await activate(this.page, this.deleteDialogueButton);
	}

	async editDialogue(newDialogue: string) {
		await activate(this.page, this.editDialogueButton);
		await typeInto(this.page, this.editDialogueInput, newDialogue);
		await activate(this.page, this.saveDialogueButton);
	}

	async addPanelBefore() {
		await activate(this.page, this.addPanelBeforeButton);
		await expect(this.page.getByRole('progressbar')).toBeHidden();
	}

	async goto(panel = 0) {
		await gotoHydrated(
			this.page,
			`/comic/${EXAMPLE_COMPLETE.id}/${EXAMPLE_COMPLETE.panels[panel].id}`,
		);

		return this;
	}
}
