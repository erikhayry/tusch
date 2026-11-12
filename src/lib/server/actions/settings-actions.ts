import { getConfigValues } from '$lib/features/settings/contracts/saveModelSettings';
import {
	ByokValuesSchema,
	decodeByokValues,
} from '$lib/features/settings/contracts/validateApiKey';
import { IMAGE_MODEL_KEY, TEXT_MODEL_KEY } from '$lib/types';
import {
	getCookieArgs,
	IMAGE_MODEL_COOKIE_NAME,
	KEY_COOKIE_NAME,
	TEXT_MODEL_COOKIE_NAME,
} from '$lib/utils/cookies';
import type { RequestEvent } from '@sveltejs/kit';
import { z } from 'zod';
import type { PingResult } from '../ai/ai-gateway';
import { credentialsFromCookies, getAiGateway } from '../ai/gateway';
import { createGenerationService } from '../generation/generation-service';
import { decodeForm, toActionFailure, type ActionResult } from './run-action';

export const ActionSuccessResultSchema = z.object({ success: z.literal(true) });
export type ActionSuccessResult = z.infer<typeof ActionSuccessResultSchema>;

/** Stores the submitted key and reports whether the provider accepts it. */
export async function validateApiKeyAction(event: RequestEvent): ActionResult<PingResult> {
	const decoded = await decodeForm(event, { decode: decodeByokValues, schema: ByokValuesSchema });
	if (!decoded.ok) return decoded.failure;

	const candidate = decoded.values.key;
	const gateway = getAiGateway({ ...credentialsFromCookies(event.cookies), apiKey: candidate });

	let result: PingResult;
	try {
		result = await createGenerationService(gateway).validateApiKey();
	} catch (cause) {
		return toActionFailure(cause);
	}

	// Only a key the provider accepted becomes the active credential; a rejected
	// candidate leaves any previously stored key in place.
	if (result.success) event.cookies.set(...getCookieArgs(KEY_COOKIE_NAME, candidate));

	return result;
}

export async function saveModelSettingsAction({
	request,
	cookies,
}: RequestEvent): Promise<ActionSuccessResult> {
	const config = getConfigValues(await request.formData());

	if (config.data?.[TEXT_MODEL_KEY]) {
		cookies.set(...getCookieArgs(TEXT_MODEL_COOKIE_NAME, config.data[TEXT_MODEL_KEY], false));
		cookies.set(...getCookieArgs(IMAGE_MODEL_COOKIE_NAME, config.data[IMAGE_MODEL_KEY], false));
	}

	return ActionSuccessResultSchema.parse({ success: true });
}

/** No-op action for client-only commands; the work happens in the browser after success. */
export async function clientCommandAction(): Promise<ActionSuccessResult> {
	return ActionSuccessResultSchema.parse({ success: true });
}
