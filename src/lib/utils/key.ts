export const COOKIE_NAME = 'byok_openai_key';

export function getCookieArgs(key: string) {
	return [
		COOKIE_NAME,
		key,
		{
			path: '/',
			httpOnly: true, // Prevents client JS / XSS from reading the key
			secure: true, // Transmitted only over HTTPS
			sameSite: 'strict', // Protects against CSRF attacks
			maxAge: 60 * 60 * 24 * 30, // Persists for 30 days
		},
	] as const;
}
