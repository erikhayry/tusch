import { SENTRY_DATA_COLLECTION, scrubEvent } from '#lib/sentry-options.ts';
import * as Sentry from '@sentry/sveltekit';

// Kit includes this file in the server build and runs it before the app. Same DSN as the
// client; unset everywhere except Vercel production, so nothing is sent elsewhere.
const dsn = process.env.PUBLIC_SENTRY_DSN;

Sentry.init({
	dsn,
	enabled: Boolean(dsn),
	dataCollection: SENTRY_DATA_COLLECTION,
	beforeSend: scrubEvent,
});
