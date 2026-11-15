import { z } from 'zod';

export const LoginFormPropsSchema = z.object({
	/** Whether a key is already stored; only the flag reaches the browser (REQ-029). */
	hasKey: z.boolean(),
});

export type LoginFormProps = z.infer<typeof LoginFormPropsSchema>;
