import { env } from '$env/dynamic/public';
import { SENTRY_DATA_COLLECTION, scrubEvent } from '$lib/sentry-options';
import * as Sentry from '@sentry/sveltekit';

// Only reports where PUBLIC_SENTRY_DSN is set (Vercel production); local dev,
// CI and E2E runs have no DSN, so nothing is sent.
Sentry.init({
	dsn: env.PUBLIC_SENTRY_DSN,
	enabled: Boolean(env.PUBLIC_SENTRY_DSN),
	dataCollection: SENTRY_DATA_COLLECTION,
	beforeSend: scrubEvent,
});

export const handleError = Sentry.handleErrorWithSentry();
