import { building } from '$app/env';
import {
	IMAGE_MODEL_COOKIE_NAME,
	KEY_COOKIE_NAME,
	TEXT_MODEL_COOKIE_NAME,
} from '$lib/utils/cookies';
import type { Cookies } from '@sveltejs/kit';
import type { AiCredentials, AiGateway } from './ai-gateway';
import { mockAiGateway } from './mock-gateway';
import { createOpenAiGateway } from './openai-gateway';

function useMockGateway(): boolean {
	return !building && process.env.PLAYWRIGHT_TEST === 'true';
}

export function credentialsFromCookies(cookies: Cookies): AiCredentials {
	return {
		apiKey: cookies.get(KEY_COOKIE_NAME),
		textModel: cookies.get(TEXT_MODEL_COOKIE_NAME),
		imageModel: cookies.get(IMAGE_MODEL_COOKIE_NAME),
	};
}

/** The gateway for one request. Playwright runs get canned responses. */
export function getAiGateway(credentials: AiCredentials): AiGateway {
	return useMockGateway() ? mockAiGateway : createOpenAiGateway(credentials);
}
