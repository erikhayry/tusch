import { generateMock } from '$lib/test/utils/generateMock';
import { CharacterSchema, PanelSchema, ResponsivePanelImageSchema } from '$lib/types';
import { describe, expect, it } from 'vitest';
import { PanelPromptSchema, toCharacterPrompt, toPanelPrompt } from '../prompts';

describe('prompt DTOs', () => {
	it('removes panel image assets and records whether an image exists', () => {
		const panel = {
			...generateMock(PanelSchema),
			image: generateMock(ResponsivePanelImageSchema),
		};

		const prompt = toPanelPrompt(panel);

		expect(prompt).not.toHaveProperty('image');
		expect(prompt.hasImage).toBe(true);
		expect(prompt.id).toBe(panel.id);
	});

	it('marks a panel without an image as hasImage false', () => {
		const panel = { ...generateMock(PanelSchema), image: undefined };

		expect(toPanelPrompt(panel).hasImage).toBe(false);
	});

	it('strips image assets when a payload is parsed as a panel prompt', () => {
		const panel = {
			...toPanelPrompt({ ...generateMock(PanelSchema), image: undefined }),
			image: generateMock(ResponsivePanelImageSchema),
		};

		expect(PanelPromptSchema.parse(panel)).not.toHaveProperty('image');
	});

	it('removes character image file references', () => {
		const character = generateMock(CharacterSchema);

		const prompt = toCharacterPrompt({
			...character,
			images: [
				{
					id: character.id,
					panelId: character.id,
					head: { src: 'head.png', width: 1, height: 1 },
					full: { src: 'full.png', width: 1, height: 1 },
				},
			],
		});

		expect(prompt).not.toHaveProperty('images');
		expect(prompt.name).toBe(character.name);
		expect(prompt.description).toEqual(character.description);
	});
});
