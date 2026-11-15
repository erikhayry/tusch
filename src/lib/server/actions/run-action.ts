import type { FormFailure } from '$lib/forms/form-failure';
import { fail, type ActionFailure, type RequestEvent } from '@sveltejs/kit';
import { z } from 'zod';
import { AiGatewayError } from '../ai/ai-gateway';
import { credentialsFromCookies, getAiGateway } from '../ai/gateway';
import {
	createGenerationService,
	InvalidAiResponseError,
	type GenerationService,
} from '../generation/generation-service';
import { reportProviderError } from '../report-error';

export type ActionResult<T> = Promise<T | ActionFailure<FormFailure>>;

/** Unexpected provider failure. One code for forms and the JSON API. */
export const PROVIDER_ERROR_CODE = 'provider_error' as const;

/** A failure as an HTTP status and a body, shared by forms and the JSON API. */
export type Failure = { status: number; body: FormFailure };

/** The operation's result, or the failure to report. */
export type Outcome<R> = { ok: true; result: R } | ({ ok: false } & Failure);

interface FormContract<T extends z.ZodType> {
	decode: (formData: FormData) => unknown;
	schema: T;
}

/** Invalid input is a 400 with the field errors, whatever decoded the values. */
export function parseValues<T extends z.ZodType>(schema: T, input: unknown): Outcome<z.output<T>> {
	const result = schema.safeParse(input);
	if (result.success) {
		return { ok: true, result: result.data };
	}

	return {
		ok: false,
		status: 400,
		body: {
			code: 'invalid_input',
			message: 'Submitted values are invalid',
			fieldErrors: z.flattenError(result.error).fieldErrors,
		},
	};
}

export async function decodeForm<T extends z.ZodType>(
	event: RequestEvent,
	{ decode, schema }: FormContract<T>,
): Promise<{ ok: true; values: z.output<T> } | { ok: false; failure: ActionFailure<FormFailure> }> {
	const parsed = parseValues(schema, decode(await event.request.formData()));
	return parsed.ok
		? { ok: true, values: parsed.result }
		: { ok: false, failure: fail(parsed.status, parsed.body) };
}

/**
 * Expected provider outcomes become failures the UI can show (and retry, for
 * rate limits). Invalid responses get their own code so the UI can show a
 * friendly message. Anything else is a 502 with an actionable message.
 *
 * Failures are returned, not thrown: SvelteKit's `error()` would send the API
 * an HTML error page, and it never reaches `handleError`, so every failure
 * reported to Sentry is reported here.
 */
export function toFailure(cause: unknown): Failure {
	if (cause instanceof InvalidAiResponseError) {
		reportProviderError(cause.code, cause.message);
		return { status: 502, body: { code: cause.code, message: cause.message } };
	}

	if (cause instanceof AiGatewayError) {
		switch (cause.kind) {
			case 'missing-key':
			case 'auth':
				return { status: 401, body: { code: 'provider_auth', message: cause.message } };
			case 'permission':
				return { status: 403, body: { code: 'provider_permission', message: cause.message } };
			case 'rate-limit':
				return { status: 429, body: { code: 'rate_limited', message: cause.message } };
		}
	}

	const message = cause instanceof Error ? cause.message : 'AI request failed';
	reportProviderError(cause instanceof AiGatewayError ? cause.kind : 'unexpected', message);
	return { status: 502, body: { code: PROVIDER_ERROR_CODE, message } };
}

export function toActionFailure(cause: unknown): ActionFailure<FormFailure> {
	const { status, body } = toFailure(cause);
	return fail(status, body);
}

/** Runs one generation operation. Provider failures come back as an `Outcome`, never thrown. */
export async function runOperation<R>(run: () => Promise<R>): Promise<Outcome<R>> {
	try {
		return { ok: true, result: await run() };
	} catch (cause) {
		return { ok: false, ...toFailure(cause) };
	}
}

/** Decode the form, then run one generation operation against the request's gateway. */
export async function runGeneration<T extends z.ZodType, R>(
	event: RequestEvent,
	contract: FormContract<T>,
	run: (service: GenerationService, values: z.output<T>) => Promise<R>,
	service: GenerationService = createGenerationService(
		getAiGateway(credentialsFromCookies(event.cookies)),
	),
): ActionResult<R> {
	const decoded = await decodeForm(event, contract);
	if (!decoded.ok) {
		return decoded.failure;
	}

	const outcome = await runOperation(() => run(service, decoded.values));
	return outcome.ok ? outcome.result : fail(outcome.status, outcome.body);
}
