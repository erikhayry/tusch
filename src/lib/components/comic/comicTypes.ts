import { z } from 'zod';

export const ComicPropsSchema = z.object({
	title: z.string(),
	settings: z.object({
		source: z.string(),
		characters: z.array(z.string()),
		panels: z.array(z.string()),
		setting: z.array(z.string())
	})
});

export type ComicProps = z.infer<typeof ComicPropsSchema>;
