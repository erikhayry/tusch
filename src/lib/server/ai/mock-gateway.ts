import { SchemaName } from '$lib/utils/ai/aiTypes';
import { COVER_IMAGE } from '$lib/utils/ai/utils/messages';
import {
	CREATE_COMIC_RESPONSE,
	CREATE_COVER_IMAGE_RESPONSE,
	CREATE_PANEL_IMAGE_RESPONSE,
	CREATE_PANEL_RESPONSE,
	createPanelImageResponse,
	IMAGE_WITHOUT_IMAGE_RESPONSE,
	INVALID_TEXT_RESPONSE,
	MODELS_RESPONSE,
} from '../../../tests/mock/openAi/openAiResponse';
import { AiGatewayError, type AiCredentials, type AiGateway } from './ai-gateway';

/** Keys containing this marker are rejected by the mock, to exercise the invalid-key flow. */
export const MOCK_INVALID_KEY_MARKER = 'invalid';

/**
 * A request whose messages contain `mock-error:<kind>` fails with that gateway
 * error, so E2E tests can drive provider failures through the real UI.
 */
export const MOCK_ERRORS = {
	auth: new AiGatewayError('auth', 'API key is invalid or rejected', 401),
	'rate-limit': new AiGatewayError(
		'rate-limit',
		'AI provider rate limit reached, try again shortly',
		429,
	),
	upstream: new AiGatewayError('upstream', 'AI provider request failed (HTTP 500): boom', 500),
} as const;

/**
 * Response markers (`docs/rules/testing.md`). `no-image-once` contains `no-image`,
 * so it is checked first.
 */
const NO_IMAGE = 'mock-error:no-image';
const NO_IMAGE_ONCE = 'mock-error:no-image-once';
const INVALID_TEXT = 'mock-error:invalid-text';

function failIfRequested(messages: string[]): void {
	const text = messages.join('\n');
	for (const [kind, error] of Object.entries(MOCK_ERRORS)) {
		if (text.includes(`mock-error:${kind}`)) throw error;
	}
}

/**
 * Ids of the comic's characters from the panel image prompt, so crops are made
 * for any comic (created or example), like the real model does.
 */
function charactersInPrompt(messages: string[]): string[] | undefined {
	const prefix = 'Characters in comic: ';
	const line = messages.find((message) => message.startsWith(prefix));
	if (!line) return undefined;
	try {
		const parsed: unknown = JSON.parse(line.slice(prefix.length));
		if (!Array.isArray(parsed)) return undefined;
		return parsed.flatMap((character) =>
			typeof character?.id === 'string' ? [character.id as string] : [],
		);
	} catch {
		return undefined;
	}
}

const mockAiGateway: AiGateway = {
	text: async ({ schemaName, messages }) => {
		failIfRequested(messages);
		if (messages.join('\n').includes(INVALID_TEXT)) return INVALID_TEXT_RESPONSE;
		return schemaName === SchemaName.enum.initComic ? CREATE_COMIC_RESPONSE : CREATE_PANEL_RESPONSE;
	},
	image: async ({ messages }) => {
		failIfRequested(messages);
		if (messages[0] === COVER_IMAGE.WHAT) return CREATE_COVER_IMAGE_RESPONSE;
		const characterIds = charactersInPrompt(messages);
		return characterIds ? createPanelImageResponse(characterIds) : CREATE_PANEL_IMAGE_RESPONSE;
	},
	ping: async () => ({ success: true, message: 'test' }),
	models: async () => MODELS_RESPONSE.data.map(({ id }) => id),
};

/** Canned provider responses for Playwright runs (`PLAYWRIGHT_TEST=true`). */
export function createMockAiGateway({ apiKey }: AiCredentials = {}): AiGateway {
	// One gateway per request (`getAiGateway`), so this counts one request's image calls.
	let imageCalls = 0;

	return {
		...mockAiGateway,
		image: async (request) => {
			failIfRequested(request.messages);
			const text = request.messages.join('\n');
			const isFirstCall = imageCalls === 0;
			imageCalls += 1;
			const withoutImage = text.includes(NO_IMAGE_ONCE) ? isFirstCall : text.includes(NO_IMAGE);
			if (withoutImage) return IMAGE_WITHOUT_IMAGE_RESPONSE;
			return mockAiGateway.image(request);
		},
		models: async () => {
			failIfRequested([apiKey ?? '']);
			return mockAiGateway.models();
		},
		ping: async () => {
			failIfRequested([apiKey ?? '']);
			return apiKey?.includes(MOCK_INVALID_KEY_MARKER)
				? { success: false, message: 'API key is invalid or rejected' }
				: { success: true, message: 'test' };
		},
	};
}
