import type { FormFailure } from '$lib/forms/form-failure';
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

interface FormContract<T extends z.ZodType> {
	decode: (formData: FormData) => unknown;
	schema: T;
}

export async function decodeForm<T extends z.ZodType>(
	event: RequestEvent,
	{ decode, schema }: FormContract<T>,
): Promise<{ ok: true; values: z.output<T> } | { ok: false; failure: ActionFailure<FormFailure> }> {
	const result = schema.safeParse(decode(await event.request.formData()));
	if (result.success) return { ok: true, values: result.data };

	return {
		ok: false,
		failure: fail(400, {
			code: 'invalid_input',
			message: 'Submitted values are invalid',
			fieldErrors: z.flattenError(result.error).fieldErrors,
		}),
	};
}

/**
 * Expected provider outcomes become form failures the UI can show (and retry,
 * for rate limits). Invalid responses are form failures too, so the UI can show a
 * friendly message. Anything else becomes a 502 with an actionable message.
 *
 * `error()` throws an HttpError, which SvelteKit never passes to `handleError`,
 * so every failure that is reported to Sentry is reported here.
 */
export function toActionFailure(cause: unknown): ActionFailure<FormFailure> {
	if (cause instanceof InvalidAiResponseError) {
		reportProviderError(cause.code, cause.message);
		return fail(502, { code: cause.code, message: cause.message });
	}

	if (cause instanceof AiGatewayError) {
		switch (cause.kind) {
			case 'missing-key':
			case 'auth':
				return fail(401, { code: 'provider_auth', message: cause.message });
			case 'permission':
				return fail(403, { code: 'provider_permission', message: cause.message });
			case 'rate-limit':
				return fail(429, { code: 'rate_limited', message: cause.message });
		}
	}

	const message = cause instanceof Error ? cause.message : 'AI request failed';
	reportProviderError(cause instanceof AiGatewayError ? cause.kind : 'unexpected', message);
	error(502, message);
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
	if (!decoded.ok) return decoded.failure;

	try {
		return await run(service, decoded.values);
	} catch (cause) {
		return toActionFailure(cause);
	}
}
