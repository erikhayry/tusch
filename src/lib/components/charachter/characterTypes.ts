import { CharacterSchema } from '$lib/types';
import { z } from 'zod';

export const CharacterPropsSchema = z.object({
	character: CharacterSchema,
	comicId: z.uuid(),
});

export type CharacterProps = z.infer<typeof CharacterPropsSchema>;
