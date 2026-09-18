import { ComicSchema } from '$lib/types';
import z from 'zod';

export const ComicJSONSchema = z.toJSONSchema(ComicSchema);
