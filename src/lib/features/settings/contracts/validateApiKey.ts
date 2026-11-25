import { readString } from '#lib/forms/form-data.ts';
import { m } from '#lib/paraglide/messages.js';
import z from 'zod';

export const BYOK_ACTION = 'byok' as const;

export const ByokValuesSchema = z.object({
	// Read per request, so the message follows the request's locale.
	key: z
		.string()
		.trim()
		.min(1, { error: () => m.byokRequired() }),
});

/** Whether the provider accepted the submitted key; shared by the action and the form. */
export const ValidateApiKeyResultSchema = z.object({
	success: z.boolean(),
	message: z.string(),
});
export type ValidateApiKeyResult = z.infer<typeof ValidateApiKeyResultSchema>;

export function decodeByokValues(formData: FormData) {
	return {
		key: readString(formData, 'key'),
	};
}
