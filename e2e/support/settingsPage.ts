import type { Locator, Page } from '@playwright/test';
import { goto } from './goto';
import { activate, chooseOption, typeInto } from './keyboard';
import { m } from './messages';
import { KEY_COPY } from './mock';

/** The Settings page, selected by role and translated name only. */
export class SettingsPage {
	readonly heading: Locator;
	readonly backLink: Locator;
	readonly keyInput: Locator;
	readonly keyHint: Locator;
	readonly saveKeyButton: Locator;
	readonly keyStatus: Locator;
	readonly keySavedMessage: Locator;
	readonly invalidKeyMessage: Locator;
	readonly modelsHeading: Locator;
	readonly noKeyModelsHint: Locator;
	readonly textModelSelect: Locator;
	readonly imageModelSelect: Locator;
	readonly saveModelsButton: Locator;
	readonly instructionsInput: Locator;
	readonly saveInstructionsButton: Locator;
	readonly instructionsSaved: Locator;
	readonly instructionsTooLong: Locator;

	constructor(readonly page: Page) {
		this.heading = page.getByRole('heading', { name: m.settings(), level: 1 });
		this.backLink = page.getByRole('link', { name: m.back() });
		this.keyInput = page.getByRole('textbox', { name: KEY_COPY.keyLabel });
		this.keyHint = page.getByText(KEY_COPY.keyHint);
		this.saveKeyButton = page.getByRole('button', { name: KEY_COPY.saveKey });
		this.keyStatus = page.getByText(KEY_COPY.keyStatus);
		this.keySavedMessage = page.getByText(KEY_COPY.keySaved);
		this.invalidKeyMessage = page.getByText(KEY_COPY.invalidKey);
		this.modelsHeading = page.getByRole('heading', { name: KEY_COPY.modelsHeading });
		this.noKeyModelsHint = page.getByText(KEY_COPY.noKeyModelsHint);
		this.textModelSelect = page.getByRole('combobox', { name: m.selectTextModel() });
		this.imageModelSelect = page.getByRole('combobox', { name: m.selectImageModel() });
		this.saveModelsButton = page.getByRole('button', { name: KEY_COPY.saveModels });
		this.instructionsInput = page.getByRole('textbox', { name: m.globalInstructions() });
		this.saveInstructionsButton = page.getByRole('button', {
			name: m.saveGlobalInstructions(),
		});
		this.instructionsSaved = page
			.getByRole('status')
			.filter({ hasText: m.globalInstructionsSaved() });
		this.instructionsTooLong = page.getByText(m.globalInstructionsTooLong());
	}

	async goto(): Promise<this> {
		await goto(this.page, '/settings');
		return this;
	}

	/** Type a key and submit with Enter, keyboard only. */
	async saveKey(key: string): Promise<void> {
		await typeInto(this.page, this.keyInput, key);
		await this.page.keyboard.press('Enter');
	}

	async saveModels(textModel: string, imageModel: string): Promise<void> {
		await chooseOption(this.page, this.textModelSelect, textModel);
		await chooseOption(this.page, this.imageModelSelect, imageModel);
		await activate(this.page, this.saveModelsButton);
	}

	/** Empty text clears the instructions. */
	async saveInstructions(text: string): Promise<void> {
		await typeInto(this.page, this.instructionsInput, text);
		await activate(this.page, this.saveInstructionsButton);
	}
}
