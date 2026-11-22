import { MODELS_RESPONSE } from '../../src/tests/mock/openAi/openAiResponse';

/** A key the mock gateway accepts. */
export const VALID_KEY = 'mock key';

/** A key the mock gateway rejects (it contains the marker `invalid`). */
export const INVALID_KEY = 'an invalid key';

/** The models the mock gateway lists, text first, image second. */
export const [TEXT_MODEL, IMAGE_MODEL] = MODELS_RESPONSE.data.map(({ id }) => id) as [
	string,
	string,
];

/**
 * The English copy for the key form, the welcome section and Settings (issue #234).
 * Literals on purpose: several message keys keep their names and only change their
 * values, so `m.byok()` would pass against old text.
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
	noKeyModelsHint: 'Add your API key to choose models.',
	createComic: 'Create new comic',
} as const;

/** Name of the HTTP-only cookie that holds the OpenAI key. */
export const KEY_COOKIE_NAME = 'byok_openai_key';
