import type { Character, ResponsiveImage, ResponsivePanelImage } from '$lib/types';

type PanelCharacters = NonNullable<ResponsivePanelImage['landscape']['characters']>;

// The example images are flat PNGs in static/examples/simple/. The sizes must
// match the files, because crops are drawn from them on a canvas.
const LANDSCAPE = { width: 768, height: 512 } as const;
const PORTRAIT = { width: 512, height: 768 } as const;

const asset = (
	name: string,
	orientation: 'landscape' | 'portrait',
	size: { width: number; height: number },
) => ({
	src: `/examples/simple/${name}-${orientation}.png`,
	...size,
});

export function exampleCover(name: string, alt: string): ResponsiveImage {
	return {
		landscape: asset(name, 'landscape', LANDSCAPE),
		portrait: asset(name, 'portrait', PORTRAIT),
		alt,
	};
}

export function examplePanelImage(
	name: string,
	alt: string,
	characters: { landscape: PanelCharacters; portrait: PanelCharacters } = {
		landscape: [],
		portrait: [],
	},
): ResponsivePanelImage {
	return {
		landscape: { ...asset(name, 'landscape', LANDSCAPE), characters: characters.landscape },
		portrait: { ...asset(name, 'portrait', PORTRAIT), characters: characters.portrait },
		alt,
	};
}

export function exampleCharacter(id: string, name: string, top: string): Character {
	return {
		id,
		name,
		description: {
			apparentAge: 'adult',
			gender: 'unspecified',
			ethnicityOrSpecies: 'human',
			facialFeatures: {
				faceShape: 'oval',
				eyeColorAndShape: 'round brown eyes',
				hairStyleAndColor: 'short dark hair',
				facialHair: null,
				distinguishingMarks: null,
			},
			bodyType: 'average',
			height: 'average',
			defaultOutfit: { top, bottom: 'dark trousers', footwear: 'boots', accessories: [] },
			masterVisualPrompt: `${name}, adult, short dark hair, ${top}, dark trousers, boots`,
		},
		images: [],
	};
}
