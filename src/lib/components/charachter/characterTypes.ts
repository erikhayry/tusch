import { CharacterSchema } from '$lib/types';
import { z } from 'zod';

export const CharacterPropsSchema = z.object({
	character: CharacterSchema.pick({
		name: true,
		description: true,
		images: true
	})
});

export type CharacterProps = z.infer<typeof CharacterPropsSchema>;
