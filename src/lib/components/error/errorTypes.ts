import { z } from 'zod';

export const ErrorPropsSchema = z.object({
    error: z.object({
	    name: z.string(),
    }),
});

export type ErrorProps = z.infer<typeof ErrorPropsSchema>;
