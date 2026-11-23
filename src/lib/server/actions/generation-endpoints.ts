import { json } from '@sveltejs/kit';
import { z } from 'zod';
import { credentialsFromAuthorizationHeader, getAiGateway } from '../ai/gateway';
import { createGenerationService, type GenerationService } from '../generation/generation-service';
import { parseValues, runOperation, type Failure } from './run-action';

const MISSING_KEY_MESSAGE = 'Send your OpenAI key as an Authorization: Bearer <key> header';

function failureResponse({ status, body }: Failure): Response {
	return json(body, { status });
}

/**
 * One generation step as a stateless JSON endpoint for scripts. The key comes
 * only from the Authorization header and is used for this request alone; nothing
 * is stored. Auth runs before the body is read, so no AI request is made without a key.
 */
export async function generationEndpoint<T extends z.ZodType, R>(
	request: Request,
	schema: T,
	run: (service: GenerationService, values: z.output<T>) => Promise<R>,
): Promise<Response> {
	const credentials = credentialsFromAuthorizationHeader(request);
	if (!credentials) {
		return failureResponse({
			status: 401,
			body: { code: 'provider_auth', message: MISSING_KEY_MESSAGE },
		});
	}

	let input: unknown;
	try {
		input = await request.json();
	} catch {
		return failureResponse({
			status: 400,
			body: { code: 'invalid_input', message: 'Request body must be JSON' },
		});
	}

	const parsed = parseValues(schema, input);
	if (!parsed.ok) {
		return failureResponse(parsed);
	}

	const service = createGenerationService(getAiGateway(credentials));
	const outcome = await runOperation(() => run(service, parsed.result));
	return outcome.ok ? json(outcome.result) : failureResponse(outcome);
}
