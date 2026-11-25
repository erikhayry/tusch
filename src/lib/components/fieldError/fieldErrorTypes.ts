import { z } from 'zod';

export const FieldErrorPropsSchema = z.object({
	/** Referenced by the field's `aria-describedby` while the message is shown (REQ-201-1). */
	id: z.string(),
	/** Absent while the field is valid; the element then isn't rendered at all. */
	message: z.string().optional(),
});

export type FieldErrorProps = z.infer<typeof FieldErrorPropsSchema>;
