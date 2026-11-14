import * as Sentry from '@sentry/sveltekit';

/**
 * Reports an unexpected provider failure to Sentry (REQ-185-3). Only the kind and
 * the message are sent, as a fresh error: no request, prompts, AI output or key
 * (REQ-029, `src/lib/sentry-options.ts`).
 */
export function reportProviderError(kind: string, message: string): void {
	const report = new Error(message);
	report.name = kind;
	Sentry.captureException(report);
}
