import { ComicStyleEnum, type ComicStyleDescription } from '$lib/types';
import type z from 'zod';

export const ANIME_STYLE: ComicStyleDescription = {
	id: 'anime',
	linework:
		'STRICT REQUIREMENT: ultra-sharp 1px ink vector outlines, uniform micro-linework, no sketchiness, no heavy brush weights',
	coloringStyle:
		'STRICT REQUIREMENT: 2-tone crisp cel shading, flat solid fill base, hard-edged shadow boundaries, zero blur gradients',
	shadingAndLighting:
		'STRICT REQUIREMENT: rim lighting on hair, high-contrast ambient key light, hard specular white highlights',
	palette: ['saturated primary colors', 'vibrant pastels', 'clean white'],
	masterStylePrompt:
		'STYLE LOCK: Modern Japanese TV anime production key visual, Kyoto Animation aesthetic, precise ultra-sharp 1px ink linework, 2-tone crisp cel-shading with hard shadow edges, clean solid color fills, hair rim lighting, vivid animation color palette, pristine digital anime art, absolute zero realistic photorealism, absolute zero oil paint texture',
};

export const CLASSIC_MARVEL_STYLE: ComicStyleDescription = {
	id: 'classic-marvel',
	linework:
		'STRICT REQUIREMENT: heavy black ink lineart, Jack Kirby bold contour lines, intense feathering and muscular cross-hatching',
	coloringStyle:
		'STRICT REQUIREMENT: 1960s 4-color CMYK process print, authentic visible Ben-Day halftone dot pattern, aged yellowed newsprint paper background',
	shadingAndLighting:
		'STRICT REQUIREMENT: extreme high-contrast chiaroscuro, heavy black ink shadow blocks, dramatic spot blacks',
	palette: [
		'vintage cyan',
		'vintage magenta',
		'vintage yellow',
		'rich spot black',
		'aged yellow paper tone',
	],
	masterStylePrompt:
		'STYLE LOCK: 1960s Silver Age American comic book panel art, Jack Kirby and Steve Ditko vintage art style, heavy dynamic black ink line work, visible micro Ben-Day halftone dot screen printing texture, aged yellowed comic paper background, 4-color CMYK process color printing, deep spot black shadows, absolute zero smooth digital gradients, absolute zero 3D render effects',
};

export const FRANCO_BELGIAN_STYLE: ComicStyleDescription = {
	id: 'franco-belgian',
	linework:
		'STRICT REQUIREMENT: Ligne claire (clear line) style, 100% uniform unvaried line weight, razor-sharp clean ink outlines for foreground and background equally',
	coloringStyle:
		'STRICT REQUIREMENT: completely flat matte color fills, zero shading, zero color gradients, zero texture noise',
	shadingAndLighting:
		'STRICT REQUIREMENT: flat ambient overhead daylight, zero heavy black shadows, depth achieved strictly through geometric perspective and line overlap',
	palette: ['warm earth tones', 'muted primary blue', 'faded olive green', 'soft beige'],
	masterStylePrompt:
		'STYLE LOCK: Franco-Belgian bande dessinée style, strict Ligne Claire art style, Hergé Tintin aesthetic, completely uniform unvaried ink outline width across all objects, flat matte solid color fills, zero shading, zero shadows, zero gradients, crisp architectural background detail, maximum graphic legibility, absolute zero digital painterly effects',
};

export const STYLES: Record<z.infer<typeof ComicStyleEnum>, ComicStyleDescription> = {
	[ComicStyleEnum.enum.anime]: ANIME_STYLE,
	[ComicStyleEnum.enum['classic-marvel']]: CLASSIC_MARVEL_STYLE,
	[ComicStyleEnum.enum['franco-belgian']]: FRANCO_BELGIAN_STYLE,
};
