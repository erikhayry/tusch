import { m } from '$lib/paraglide/messages';
import { ComicsMock } from '$lib/types/test/utils/mockTypes';
import type { Locator, Page } from '@playwright/test';
import { mockImageResponse } from '../../../../../api/chat/image/utils/mock';

export class PanelPage {
	readonly page: Page;
	readonly deleteImageButton: Locator;
	readonly image: Locator;
	readonly mockedImage: Locator;
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

	constructor(page: Page) {
		this.page = page;
		this.createImageButton = page.getByRole('button', { name: m.addImage() });
		this.deleteImageButton = page.getByRole('button', { name: m.removeImage() });
		this.replaceImageButton = page.getByRole('button', { name: m.generateNewImage() });
		this.image = page.getByRole('img', { name: ComicsMock[0].panels[0].image?.alt });
		this.mockedImage = page.getByRole('img', { name: mockImageResponse.alt });

		this.editCaptionButton = page.getByRole('button', { name: m.editCaption({ number: 1 }) });
		this.editCaptionInput = page.getByRole('textbox', { name: m.editCaption({ number: 1 }) });
		this.saveCaptionButton = page.getByRole('button', { name: m.saveCaption({ number: 1 }) });
		this.deleteCaptionButton = page.getByRole('button', { name: m.deleteCaption({ number: 1 }) });

		this.editDialogueButton = page.getByRole('button', { name: m.editDialogue({ number: 1 }) });
		this.editDialogueInput = page.getByRole('textbox', { name: m.editDialogue({ number: 1 }) });
		this.saveDialogueButton = page.getByRole('button', { name: m.saveDialogue({ number: 1 }) });
		this.deleteDialogueButton = page.getByRole('button', { name: m.deleteDialogue({ number: 1 }) });
	}

	async removeCaption() {
		await this.deleteCaptionButton.click();
	}

	async editCaption(newCaption: string) {
		await this.editCaptionButton.click();
		await this.editCaptionInput.fill(newCaption);
		await this.saveCaptionButton.click();
	}

	async removeDialogue() {
		await this.deleteDialogueButton.click();
	}

	async editDialogue(newDialogue: string) {
		await this.editDialogueButton.click();
		await this.editDialogueInput.fill(newDialogue);
		await this.saveDialogueButton.click();
	}

	goto() {
		this.page.goto(`/comic/${ComicsMock[0].id}/${ComicsMock[0].panels[0].id}`);

		return this;
	}
}
