import type { FormFailure } from '#lib/forms/form-failure.ts';
import { error, fail, type ActionFailure, type RequestEvent } from '@sveltejs/kit';
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

/** Unexpected provider failure, as the JSON API reports it. */
export const PROVIDER_ERROR_CODE = 'provider_error' as const;

/**
 * The browser aborted the request (REQ-315-1). Nobody reads the answer and it isn't an
 * error, so it is never reported to Sentry or logged as `provider_error`.
 */
const CANCELLED: Failure = {
	status: 499,
	body: { code: 'cancelled', message: 'Generation was cancelled' },
};

/** A failure as an HTTP status and a body. */
export type Failure = { status: number; body: FormFailure };

/** The operation's result, or the failure to report. */
export type Outcome<R> = { ok: true; result: R } | ({ ok: false } & Failure);

interface FormContract<T extends z.ZodType> {
	decode: (formData: FormData) => unknown;
	schema: T;
	/** Copy for an invalid field the error region must name; otherwise the generic message. */
	failureMessage?: (error: z.ZodError) => string | undefined;
}

const INVALID_VALUES_MESSAGE = 'Submitted values are invalid';

/** Invalid input is a 400 with the field errors, whatever decoded the values. */
export function parseValues<T extends z.ZodType>(
	schema: T,
	input: unknown,
	failureMessage?: (error: z.ZodError) => string | undefined,
): Outcome<z.output<T>> {
	const result = schema.safeParse(input);
	if (result.success) {
		return { ok: true, result: result.data };
	}

	return {
		ok: false,
		status: 400,
		body: {
			code: 'invalid_input',
			message: failureMessage?.(result.error) ?? INVALID_VALUES_MESSAGE,
			fieldErrors: z.flattenError(result.error).fieldErrors,
		},
	};
}

export async function decodeForm<T extends z.ZodType>(
	event: RequestEvent,
	{ decode, schema, failureMessage }: FormContract<T>,
): Promise<{ ok: true; values: z.output<T> } | { ok: false; failure: ActionFailure<FormFailure> }> {
	const parsed = parseValues(schema, decode(await event.request.formData()), failureMessage);
	return parsed.ok
		? { ok: true, values: parsed.result }
		: { ok: false, failure: fail(parsed.status, parsed.body) };
}

/**
 * Expected provider outcomes become failures the UI can show (and retry, for
 * rate limits). Invalid responses are failures too, so the UI can show a friendly
 * message; they are reported to Sentry here (REQ-185-3), since a returned failure
 * never reaches `handleError`. Returns `null` for anything unexpected.
 */
function knownFailure(cause: unknown): Failure | null {
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

	return null;
}

function unexpectedMessage(cause: unknown): string {
	return cause instanceof Error ? cause.message : 'AI request failed';
}

/** Forms: an unexpected failure is thrown as a 502, so `handleError` reports it once. */
export function toActionFailure(cause: unknown): ActionFailure<FormFailure> {
	const known = knownFailure(cause);
	if (known) {
		return fail(known.status, known.body);
	}

	error(502, unexpectedMessage(cause));
}

/**
 * Runs one generation operation for the JSON API. Failures come back as an `Outcome`,
 * never thrown: SvelteKit's `error()` would answer the API with an HTML page, and it
 * is reported here, since `handleError` only sees thrown errors.
 */
export async function runOperation<R>(
	run: () => Promise<R>,
	signal: AbortSignal,
): Promise<Outcome<R>> {
	try {
		return { ok: true, result: await run() };
	} catch (cause) {
		if (signal.aborted) {
			return { ok: false, ...CANCELLED };
		}

		const known = knownFailure(cause);
		if (known) {
			return { ok: false, ...known };
		}

		const message = unexpectedMessage(cause);
		reportProviderError('unexpected', message);
		return { ok: false, status: 502, body: { code: PROVIDER_ERROR_CODE, message } };
	}
}

/**
 * Decode the form, then run one generation operation against the request's gateway.
 * `run` gets the request's abort signal, which the provider call also honours (REQ-315-1).
 */
export async function runGeneration<T extends z.ZodType, R>(
	event: RequestEvent,
	contract: FormContract<T>,
	run: (service: GenerationService, values: z.output<T>, signal: AbortSignal) => Promise<R>,
	service: GenerationService = createGenerationService(
		getAiGateway(credentialsFromCookies(event.cookies)),
	),
): ActionResult<R> {
	const decoded = await decodeForm(event, contract);
	if (!decoded.ok) {
		return decoded.failure;
	}

	const { signal } = event.request;
	try {
		return await run(service, decoded.values, signal);
	} catch (cause) {
		if (signal.aborted) {
			return fail(CANCELLED.status, CANCELLED.body);
		}
		return toActionFailure(cause);
	}
}
