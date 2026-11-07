import { CharacterSchema, PanelSchema, type Character, type Panel } from '$lib/types';
import z from 'zod';

export const PanelPromptSchema = PanelSchema.omit({ image: true }).extend({
	hasImage: z.boolean(),
});
export type PanelPrompt = z.infer<typeof PanelPromptSchema>;

export function toPanelPrompt({ image, ...panel }: Panel): PanelPrompt {
	return { ...panel, hasImage: Boolean(image) };
}

export const CharacterPromptSchema = CharacterSchema.omit({ images: true });
export type CharacterPrompt = z.infer<typeof CharacterPromptSchema>;

export function toCharacterPrompt(character: Character): CharacterPrompt {
	return CharacterPromptSchema.parse(character);
}
