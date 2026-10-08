import { z } from 'zod';

export const LoaderPropsSchema = z.object({
	isLoading: z.boolean(),
});

export type LoaderProps = z.infer<typeof LoaderPropsSchema>;
