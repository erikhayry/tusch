import { z } from 'zod';

export const LoginFormPropsSchema = z.object({
	/** Whether a key is already stored; only the flag reaches the browser (REQ-029). */
	hasKey: z.boolean(),
});

/**
 * `onSaved` runs after the provider accepted a key. Only Settings passes it, to reload its
 * page data (the model lists and `hasKey`); the start page must keep its welcome section,
 * which shows the "Key saved" confirmation.
 */
export type LoginFormProps = z.infer<typeof LoginFormPropsSchema> & {
	onSaved?: () => Promise<void> | void;
};
