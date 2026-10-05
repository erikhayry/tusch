import type { Panel } from '$lib/types';

export const INIT = {
	WHAT: 'Create a comic script from attached url and instructions',
	HOW: 'number of panels should be 5 to 10',
};

export const IMAGE = {
	WHAT: 'Create a comic panel image.',
	HOWS: [
		'Do not include any text in the image.',
		'Do not add any borders to the image.',
		'alt field should only describe what is in the image',
	],
};

export function buildInitialMessages(url: string): string[] {
	return [INIT.WHAT, url, INIT.HOW];
}

export function buildImageMessages(scene: string, panel: Panel): string[] {
	return [
		IMAGE.WHAT,
		`scene: ${scene}`,
		//`dialogue: ${panel.dialogue.join(' ')}`,
		//`captions: ${panel.captions.join(' ')}`,
		...IMAGE.HOWS,
	];
}
