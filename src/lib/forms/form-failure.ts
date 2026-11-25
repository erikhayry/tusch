import { m } from '#lib/paraglide/messages.js';
import { z } from 'zod';

export const FormFailureSchema = z.object({
	code: z.string(),
	message: z.string(),
	fieldErrors: z.record(z.string(), z.array(z.string()).optional()).optional(),
});
export type FormFailure = z.infer<typeof FormFailureSchema>;

const UNKNOWN_FAILURE: FormFailure = { code: 'unknown', message: 'Submission failed' };

/**
 * Failures whose server message is technical. The user sees a translated sentence,
 * and the server message goes behind "Show details" (REQ-185-2).
 */
const FRIENDLY_MESSAGES: Partial<Record<string, () => string>> = {
	ai_no_image: () => m.aiNoImage(),
	invalid_ai_response: () => m.aiInvalidResponse(),
};

export function toUserMessage(failure: FormFailure): { message: string; details?: string } {
	const friendly = FRIENDLY_MESSAGES[failure.code];

	return friendly
		? { message: friendly(), details: failure.message }
		: { message: failure.message };
}

/** The first message for each rejected field, keyed by the field's name. */
const FieldMessagesSchema = z.record(z.string(), z.string());
export type FieldMessages = z.infer<typeof FieldMessagesSchema>;

export function toFieldMessages(failure: FormFailure): FieldMessages {
	const messages: FieldMessages = {};
	for (const [field, fieldMessages] of Object.entries(failure.fieldErrors ?? {})) {
		const first = fieldMessages?.[0];
		if (first !== undefined) {
			messages[field] = first;
		}
	}

	return FieldMessagesSchema.parse(messages);
}

export function toFormFailure(data: unknown): FormFailure {
	const record = typeof data === 'object' && data !== null ? data : {};
	const parsed = FormFailureSchema.safeParse({ ...UNKNOWN_FAILURE, ...record });

	return parsed.success ? parsed.data : UNKNOWN_FAILURE;
}
