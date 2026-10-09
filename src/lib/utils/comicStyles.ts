import { ComicStyleEnum, type ComicStyleDescription } from '$lib/types';
import type z from 'zod';

export const ANIME_STYLE: ComicStyleDescription = {
	id: ComicStyleEnum.enum.anime,
	linework: 'Crisp, fine-line ink contours with precise, clean strokes and smooth curves',
	coloringStyle: 'Cel-shaded coloring with sharp contrast boundaries and soft gradient highlights',
	shadingAndLighting:
		'High-contrast ambient lighting with distinct hard-edge shadows and hair highlights',
	palette: ['saturated primary colors', 'vibrant pastels', 'soft ambient tones'],
	masterStylePrompt:
		'Japanese anime aesthetic, clean sharp linework, high contrast cel shading, vivid color palette, expressive feature rendering, polished studio production style',
};

export const CLASSIC_MARVEL_STYLE: ComicStyleDescription = {
	id: ComicStyleEnum.enum['classic-marvel'],
	linework:
		'Dynamic variable-weight black ink lines, expressive cross-hatching, and muscular contouring',
	coloringStyle: 'Vintage Ben-Day halftone dots with four-color process printing (CMYK)',
	shadingAndLighting:
		'High-contrast chiaroscuro with heavy black ink shadows and dramatic spot blacks',
	palette: ['primary red', 'bold blue', 'vibrant yellow', 'saturated secondary tones'],
	masterStylePrompt:
		'1960s-1970s Silver Age American comic book art style, Jack Kirby and Steve Ditko influence, dynamic black ink lines, visible Ben-Day halftone dots, vintage paper texture, dramatic chiaroscuro lighting, bold primary colors',
};

export const FRANCO_BELGIAN_STYLE: ComicStyleDescription = {
	id: ComicStyleEnum.enum['franco-belgian'],
	linework:
		'Ligne claire (clear line) style with uniform, unvaried line weight and precise architectural contours',
	coloringStyle: 'Flat, uniform color fills without gradients, maintaining absolute legibility',
	shadingAndLighting:
		'Minimal to no shadow modeling; relies on line geometry and color contrast for depth',
	palette: ['warm earth tones', 'soft muted primaries', 'balanced naturalistic hues'],
	masterStylePrompt:
		'Franco-Belgian bande dessinée style, ligne claire, Hergé Tintin aesthetic, uniform ink line width, flat clean color fills, no heavy shadows, detailed architectural backgrounds, high narrative clarity',
};

export const STYLES: Record<z.infer<typeof ComicStyleEnum>, ComicStyleDescription> = {
	[ComicStyleEnum.enum.anime]: ANIME_STYLE,
	[ComicStyleEnum.enum['classic-marvel']]: CLASSIC_MARVEL_STYLE,
	[ComicStyleEnum.enum['franco-belgian']]: FRANCO_BELGIAN_STYLE,
};
