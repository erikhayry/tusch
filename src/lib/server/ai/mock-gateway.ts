import { SchemaName } from '$lib/utils/ai/aiTypes';
import { COVER_IMAGE } from '$lib/utils/ai/utils/messages';
import {
	CREATE_COMIC_RESPONSE,
	CREATE_COVER_IMAGE_RESPONSE,
	CREATE_PANEL_IMAGE_RESPONSE,
	CREATE_PANEL_RESPONSE,
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

function failIfRequested(messages: string[]): void {
	const text = messages.join('\n');
	for (const [kind, error] of Object.entries(MOCK_ERRORS)) {
		if (text.includes(`mock-error:${kind}`)) throw error;
	}
}

const mockAiGateway: AiGateway = {
	text: async ({ schemaName, messages }) => {
		failIfRequested(messages);
		return schemaName === SchemaName.enum.initComic ? CREATE_COMIC_RESPONSE : CREATE_PANEL_RESPONSE;
	},
	image: async ({ messages }) => {
		failIfRequested(messages);
		return messages[0] === COVER_IMAGE.WHAT
			? CREATE_COVER_IMAGE_RESPONSE
			: CREATE_PANEL_IMAGE_RESPONSE;
	},
	ping: async () => ({ success: true, message: 'test' }),
	models: async () => MODELS_RESPONSE.data.map(({ id }) => id),
};

/** Canned provider responses for Playwright runs (`PLAYWRIGHT_TEST=true`). */
export function createMockAiGateway({ apiKey }: AiCredentials = {}): AiGateway {
	return {
		...mockAiGateway,
		ping: async () => {
			failIfRequested([apiKey ?? '']);
			return apiKey?.includes(MOCK_INVALID_KEY_MARKER)
				? { success: false, message: 'API key is invalid or rejected' }
				: { success: true, message: 'test' };
		},
	};
}
