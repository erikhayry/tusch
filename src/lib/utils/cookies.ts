import { IMAGE_MODEL_KEY, TEXT_MODEL_KEY } from '$lib/types';

export const KEY_COOKIE_NAME = 'byok_openai_key';
export const TEXT_MODEL_COOKIE_NAME = TEXT_MODEL_KEY;
export const IMAGE_MODEL_COOKIE_NAME = IMAGE_MODEL_KEY;

export function getCookieArgs(name: string, value: string, httpOnly = true) {
	return [
		name,
		value,
		{
			path: '/',
			httpOnly, // Prevents client JS / XSS from reading the key
			secure: true, // Transmitted only over HTTPS
			sameSite: 'strict', // Protects against CSRF attacks
			maxAge: 60 * 60 * 24 * 30, // Persists for 30 days
		},
	] as const;
}
