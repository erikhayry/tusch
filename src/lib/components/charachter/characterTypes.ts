import { CharacterSchema } from '#lib/types/index.ts';
import { z } from 'zod';

export const CharacterPropsSchema = z.object({
	character: CharacterSchema,
	comicId: z.uuid(),
});

export type CharacterProps = z.infer<typeof CharacterPropsSchema>;
