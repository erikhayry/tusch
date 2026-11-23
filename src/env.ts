import { defineEnvVars } from '@sveltejs/kit/env';

// Optional: unset everywhere except Vercel production, where it turns Sentry on
// (hooks.client.ts, instrumentation.server.ts). A missing value must stay valid.
export const variables = defineEnvVars({
	PUBLIC_SENTRY_DSN: { public: true, schema: (input) => input },
});
