import type { Crop } from '$lib/types';
import {
	CharacterBoxesSchema,
	SchemaName,
	type CharacterBoxes,
	type OpenAiOutput,
} from '$lib/utils/ai/aiTypes';
import { COVER_IMAGE, CURRENT_BOXES_PREFIX } from '$lib/utils/ai/utils/messages';
import {
	CREATE_COMIC_RESPONSE,
	createComicResponse,
	CREATE_COVER_IMAGE_RESPONSE,
	CREATE_PANEL_IMAGE_RESPONSE,
	createPanelImageResponse,
	createPanelResponse,
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
/** A create-comic request answered with an empty title (REQ-236-3). */
const EMPTY_TITLE = 'mock-error:empty-title';
/** A crop fix answered with boxes outside the image (REQ-219-4). Read from the API key too. */
const INVALID_CROP = 'mock-error:invalid-crop';

/** Used when the request has no boxes to start from (a character the panel image doesn't place). */
const DEFAULT_BOXES: CharacterBoxes = {
	head: { x: 190, y: 220, width: 170, height: 200 },
	full: { x: 32, y: 220, width: 445, height: 1290 },
};

function failIfRequested(messages: string[]): void {
	const text = messages.join('\n');
	for (const [kind, error] of Object.entries(MOCK_ERRORS)) {
		if (text.includes(`mock-error:${kind}`)) {
			throw error;
		}
	}
}

/**
 * Ids of the comic's characters from the panel image prompt, so crops are made
 * for any comic (created or example), like the real model does.
 */
function charactersInPrompt(messages: string[]): string[] | undefined {
	const prefix = 'Characters in comic: ';
	const line = messages.find((message) => message.startsWith(prefix));
	if (!line) {
		return undefined;
	}
	try {
		const parsed: unknown = JSON.parse(line.slice(prefix.length));
		if (!Array.isArray(parsed)) {
			return undefined;
		}
		return parsed.flatMap((character) =>
			typeof character?.id === 'string' ? [character.id as string] : [],
		);
	} catch {
		return undefined;
	}
}

/** The boxes the request says are current (the hint from `buildFixCharacterCropMessages`). */
function currentBoxes(messages: string[]): CharacterBoxes | undefined {
	const line = messages.find((message) => message.startsWith(CURRENT_BOXES_PREFIX));
	if (!line) {
		return undefined;
	}

	const parsed = CharacterBoxesSchema.safeParse(
		JSON.parse(line.slice(CURRENT_BOXES_PREFIX.length)),
	);
	return parsed.success ? parsed.data : undefined;
}

/**
 * A box 10% smaller on every side, moved a little: the sizes change on every fix,
 * and it stays inside the box it started from, so inside the image too.
 */
function shrink({ x, y, width, height }: Crop): Crop {
	return {
		x: x + Math.round(width * 0.1),
		y: y + Math.round(height * 0.1),
		width: Math.round(width * 0.8),
		height: Math.round(height * 0.8),
	};
}

function cropOutput(boxes: CharacterBoxes): OpenAiOutput {
	return {
		output: [
			{
				type: 'message',
				content: [{ type: 'output_text', text: JSON.stringify({ data: boxes }) }],
			},
		],
	};
}

function fixCropResponse(messages: string[]): OpenAiOutput {
	if (messages.join('\n').includes(INVALID_CROP)) {
		const outside: Crop = { x: 5000, y: 5000, width: 100, height: 100 };
		return cropOutput({ head: outside, full: outside });
	}

	const boxes = currentBoxes(messages) ?? DEFAULT_BOXES;
	return cropOutput({ head: shrink(boxes.head), full: shrink(boxes.full) });
}

const mockAiGateway: AiGateway = {
	text: async ({ schemaName, messages }) => {
		failIfRequested(messages);
		if (messages.join('\n').includes(INVALID_TEXT)) {
			return INVALID_TEXT_RESPONSE;
		}
		if (schemaName === SchemaName.enum.initComic) {
			return messages.join('\n').includes(EMPTY_TITLE)
				? createComicResponse('')
				: CREATE_COMIC_RESPONSE;
		}
		return createPanelResponse();
	},
	image: async ({ messages }) => {
		failIfRequested(messages);
		if (messages[0] === COVER_IMAGE.WHAT) {
			return CREATE_COVER_IMAGE_RESPONSE;
		}
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
		text: async (request) => {
			// The API key is part of the scope too, as documented in testing.md.
			const scope = [apiKey ?? '', ...request.messages];
			failIfRequested(scope);
			if (request.schemaName === SchemaName.enum.fixCharacterCrop) {
				return fixCropResponse(scope);
			}
			return mockAiGateway.text(request);
		},
		image: async (request) => {
			failIfRequested(request.messages);
			const text = request.messages.join('\n');
			const isFirstCall = imageCalls === 0;
			imageCalls += 1;
			const withoutImage = text.includes(NO_IMAGE_ONCE) ? isFirstCall : text.includes(NO_IMAGE);
			if (withoutImage) {
				return IMAGE_WITHOUT_IMAGE_RESPONSE;
			}
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
