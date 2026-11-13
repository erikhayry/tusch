import type { ErrorEvent, init } from '@sentry/sveltekit';

type DataCollection = NonNullable<NonNullable<Parameters<typeof init>[0]>['dataCollection']>;

/**
 * Shared Sentry settings for the browser and the server (issue #53).
 *
 * The user's OpenAI key lives in an httpOnly cookie and is posted once by the
 * settings form (REQ-029), and prompts contain the user's source article. So
 * nothing that could carry them is collected: no cookies, headers, request
 * bodies, local variables, user info or AI inputs/outputs.
 */
export const SENTRY_DATA_COLLECTION: DataCollection = {
	userInfo: false,
	cookies: false,
	httpHeaders: false,
	httpBodies: [],
	urlQueryParams: false,
	stackFrameVariables: false,
	genAI: { inputs: false, outputs: false },
};

// OpenAI keys (`sk-…`, `sk-proj-…`). Defence in depth: should anything still
// carry a key (e.g. an error message), it is masked before the event leaves.
const OPENAI_KEY = /sk-[A-Za-z0-9_-]{16,}/g;

export function scrubEvent(event: ErrorEvent): ErrorEvent {
	return JSON.parse(JSON.stringify(event).replace(OPENAI_KEY, '[Filtered]'));
}
