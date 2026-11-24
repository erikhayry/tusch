/**
 * The English copy issue #234 fixes for the key form, the welcome section and the
 * Settings page. Literals on purpose: `byok`, `add`, `keyAdded`, `invalidKey`, `config`
 * and `saveConfig` keep their keys and only change their values, so `m.byok()` would
 * pass against the old "BYOK" text. The playwright locale is English.
 */
export const KEY_COPY = {
	welcomeHeading: 'Welcome to Tusch',
	welcomeSentence:
		'Tusch uses OpenAI to draw your comics, so you need your own OpenAI API key. Add it here to create a comic; you can look at the examples below without one.',
	keyLabel: 'OpenAI API key',
	keyHint:
		'Stored only in this browser as a secure cookie and used only to talk to OpenAI. Create one at platform.openai.com/api-keys.',
	saveKey: 'Save key',
	keySaved: 'Key saved. You can now create a comic.',
	invalidKey: "OpenAI didn't accept this key. Check it and try again.",
	keyStatus: 'A key is saved. Enter a new one to replace it.',
	modelsHeading: 'AI models',
	saveModels: 'Save models',
	noKeyModelsHint: 'Add your API key above to choose models.',
	createComic: 'Create new comic',
} as const;
