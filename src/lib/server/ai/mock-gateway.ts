import { COVER_IMAGE } from '$lib/utils/ai/utils/messages';
import { SchemaName } from '$lib/utils/ai/aiTypes';
import {
	CREATE_COMIC_RESPONSE,
	CREATE_COVER_IMAGE_RESPONSE,
	CREATE_PANEL_IMAGE_RESPONSE,
	CREATE_PANEL_RESPONSE,
	MODELS_RESPONSE,
} from '../../../tests/mock/openAi/openAiResponse';
import type { AiGateway } from './ai-gateway';

/** Canned provider responses for Playwright runs (`PLAYWRIGHT_TEST=true`). */
export const mockAiGateway: AiGateway = {
	text: async ({ schemaName }) =>
		schemaName === SchemaName.enum.initComic ? CREATE_COMIC_RESPONSE : CREATE_PANEL_RESPONSE,
	image: async ({ messages }) =>
		messages[0] === COVER_IMAGE.WHAT ? CREATE_COVER_IMAGE_RESPONSE : CREATE_PANEL_IMAGE_RESPONSE,
	ping: async () => ({ success: true, message: 'test' }),
	models: async () => MODELS_RESPONSE.data.map(({ id }) => id),
};
