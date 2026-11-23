import { PUBLIC_SENTRY_DSN } from '$app/env/public';
import { SENTRY_DATA_COLLECTION, scrubEvent } from '#lib/sentry-options.ts';
import * as Sentry from '@sentry/sveltekit';

// Only reports where PUBLIC_SENTRY_DSN is set (Vercel production); local dev,
// CI and E2E runs have no DSN, so nothing is sent.
Sentry.init({
	dsn: PUBLIC_SENTRY_DSN,
	enabled: Boolean(PUBLIC_SENTRY_DSN),
	dataCollection: SENTRY_DATA_COLLECTION,
	beforeSend: scrubEvent,
});

export const handleError = Sentry.handleErrorWithSentry();
