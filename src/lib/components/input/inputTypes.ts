import { z } from 'zod';

export const InputPropsSchema = z.object({
    input: z.object({
	    name: z.string(),
    }),
});

export type InputProps = z.infer<typeof InputPropsSchema>;
