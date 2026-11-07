import { z } from 'zod';

export const FormFailureSchema = z.object({
	code: z.string(),
	message: z.string(),
	fieldErrors: z.record(z.string(), z.array(z.string()).optional()).optional(),
});
export type FormFailure = z.infer<typeof FormFailureSchema>;
