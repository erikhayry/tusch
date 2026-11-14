import { building } from '$app/env';
import {
	IMAGE_MODEL_COOKIE_NAME,
	KEY_COOKIE_NAME,
	TEXT_MODEL_COOKIE_NAME,
} from '$lib/utils/cookies';
import type { Cookies } from '@sveltejs/kit';
import type { AiCredentials, AiGateway } from './ai-gateway';
import { createMockAiGateway } from './mock-gateway';
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

const BEARER_PATTERN = /^Bearer\s+(\S+)$/;

/**
 * The key from `Authorization: Bearer <key>`, the only way the JSON API takes it.
 * No cookie fallback: a cross-site page can't set this header without a CORS preflight.
 */
export function credentialsFromAuthorizationHeader(request: Request): AiCredentials | undefined {
	const apiKey = BEARER_PATTERN.exec(request.headers.get('authorization') ?? '')?.[1];
	return apiKey ? { apiKey } : undefined;
}

/** The gateway for one request. Playwright runs get canned responses. */
export function getAiGateway(credentials: AiCredentials): AiGateway {
	return useMockGateway() ? createMockAiGateway(credentials) : createOpenAiGateway(credentials);
}
