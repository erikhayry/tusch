/**
 * The copy issue #300 gives the Settings cards, in both locales. Literals on purpose:
 * `byok`, `selectTextModel`, `selectImageModel` and `saveGlobalInstructions` keep their keys and
 * only change their values, so `m.*()` would pass against the old text; the new keys don't exist
 * until the developer adds them. Keys are the message keys from the ticket.
 */
export const SETTINGS_COPY = {
	en: {
		keyCardTitle: 'OpenAI API key',
		byok: 'OpenAI API key',
		keyBadgeSaved: 'Key saved',
		keyBadgeMissing: 'No key yet',
		noKeyModelsHint: 'Add your API key above to choose models.',
		selectTextModel: 'Text model',
		textModelHelp: 'Writes panels, captions and dialogue',
		selectImageModel: 'Image model',
		imageModelHelp: 'Draws covers and panel images',
		globalInstructionsLabel: 'Added to every AI prompt',
		globalInstructionsHint: 'Up to 1000 characters.',
		globalInstructionsPlaceholder: 'e.g. Keep dialogue short. Write in Swedish. No modern objects.',
		saveGlobalInstructions: 'Save instructions',
		count: (count: number) => `${count} of 1000`,
	},
	'sv-se': {
		keyCardTitle: 'OpenAI API-nyckel',
		byok: 'OpenAI API-nyckel',
		keyBadgeSaved: 'Nyckel sparad',
		keyBadgeMissing: 'Ingen nyckel än',
		noKeyModelsHint: 'Lägg till din API-nyckel ovan för att välja modeller.',
		selectTextModel: 'Textmodell',
		textModelHelp: 'Skriver rutor, bildtexter och dialog',
		selectImageModel: 'Bildmodell',
		imageModelHelp: 'Ritar omslag och rutbilder',
		globalInstructionsLabel: 'Läggs till i varje AI-prompt',
		globalInstructionsHint: 'Högst 1000 tecken.',
		globalInstructionsPlaceholder:
			't.ex. Håll dialogen kort. Skriv på svenska. Inga moderna föremål.',
		saveGlobalInstructions: 'Spara instruktioner',
		count: (count: number) => `${count} av 1000`,
	},
} as const;
