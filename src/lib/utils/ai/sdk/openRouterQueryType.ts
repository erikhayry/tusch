import z from 'zod';

export const OpenRouterQueryTypeSchema = z.object({
	messages: z.array(
		z.object({
			role: z.string(),
			content: z.string(),
		}),
	),
});

export type OpenRouterQueryType = z.infer<typeof OpenRouterQueryTypeSchema>;
