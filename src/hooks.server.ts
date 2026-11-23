import { getTextDirection } from '#lib/paraglide/runtime.js';
import { paraglideMiddleware } from '#lib/paraglide/server.js';
import * as Sentry from '@sentry/sveltekit';
import { sequence, type Handle } from '@sveltejs/kit/hooks';

const handleParaglide: Handle = ({ event, resolve }) =>
	paraglideMiddleware(event.request, ({ locale }) =>
		resolve(event, {
			transformPageChunk: ({ html }) =>
				html
					.replace('%paraglide.lang%', locale)
					.replace('%paraglide.dir%', getTextDirection(locale)),
		}),
	);

export const handle: Handle = sequence(Sentry.sentryHandle(), handleParaglide);

export const handleError = Sentry.handleErrorWithSentry();
