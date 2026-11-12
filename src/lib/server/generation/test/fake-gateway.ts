import { vi } from 'vitest';
import {
	CREATE_COMIC_RESPONSE,
	CREATE_COVER_IMAGE_RESPONSE,
	CREATE_PANEL_IMAGE_RESPONSE,
	CREATE_PANEL_RESPONSE,
} from '../../../../tests/mock/openAi/openAiResponse';
import type { AiGateway } from '../../ai/ai-gateway';

const defaults: AiGateway = {
	text: async ({ schemaName }) =>
		schemaName === 'initComic' ? CREATE_COMIC_RESPONSE : CREATE_PANEL_RESPONSE,
	image: async ({ messages }) =>
		messages.some((message) => message.startsWith('Generate a cover'))
			? CREATE_COVER_IMAGE_RESPONSE
			: CREATE_PANEL_IMAGE_RESPONSE,
	ping: async () => ({ success: true, message: 'ok' }),
	models: async () => [],
};

/** In-memory gateway with canned responses; every method is a spy. */
export function fakeGateway(overrides: Partial<AiGateway> = {}) {
	return {
		text: vi.fn<AiGateway['text']>(overrides.text ?? defaults.text),
		image: vi.fn<AiGateway['image']>(overrides.image ?? defaults.image),
		ping: vi.fn<AiGateway['ping']>(overrides.ping ?? defaults.ping),
		models: vi.fn<AiGateway['models']>(overrides.models ?? defaults.models),
	};
}
