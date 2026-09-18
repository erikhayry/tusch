import { ComicSchema } from '$lib/types';
import { z } from 'zod';

export const ComicPropsSchema = z.object({
	comic: ComicSchema
});

export type ComicProps = z.infer<typeof ComicPropsSchema>;
