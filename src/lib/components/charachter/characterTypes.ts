import { z } from 'zod';

export const CharacterPropsSchema = z.object({
	name: z.string()
});

export type CharacterProps = z.infer<typeof CharacterPropsSchema>;
