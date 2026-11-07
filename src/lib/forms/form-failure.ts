import { z } from 'zod';

export const FormFailureSchema = z.object({
	code: z.string(),
	message: z.string(),
	fieldErrors: z.record(z.string(), z.array(z.string()).optional()).optional(),
});
export type FormFailure = z.infer<typeof FormFailureSchema>;

const UNKNOWN_FAILURE: FormFailure = { code: 'unknown', message: 'Submission failed' };

export function toFormFailure(data: unknown): FormFailure {
	const record = typeof data === 'object' && data !== null ? data : {};
	const parsed = FormFailureSchema.safeParse({ ...UNKNOWN_FAILURE, ...record });

	return parsed.success ? parsed.data : UNKNOWN_FAILURE;
}
