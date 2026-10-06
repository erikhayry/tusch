import type { Panel } from '$lib/types';
import { OPEN_AI_ROLE } from './settings';

export const INIT = {
	WHAT: 'create a comic script from attached url and instructions',
	HOWS: [
		'language should be same as source',
		'number of panels should be 5 to 10',
		'the year field in the response should be included and match the year of the panel (e.g. 2023 if the panel is situated in 2023)', //not followed
	],
};

export const IMAGE = {
	WHAT: 'create a comic panel image',
	HOWS: [
		'use included data to create the image',
		'do not include any text in the image',
		'do not add any borders to the image',
		'alt field should only describe what is in the image',
	],
};

export function buildInitialMessages(url: string): string[] {
	return [INIT.WHAT, url, ...INIT.HOWS];
}

export function buildImageMessages(panel: Panel): string[] {
	return [
		IMAGE.WHAT,
		`visualDescription: ${panel.visualDescription}`,
		`dialogue: ${panel.dialogue.join('. ')}`,
		`captions: ${panel.captions.join('. ')}`,
		`season: ${panel.season}`,
		`year: ${panel.year}`,
		`time of day: ${panel.timeOfDay}`,
		...IMAGE.HOWS,
	];
}

export function getChatMessages(messages: string[]) {
	return messages.map((message) => ({ content: message, role: OPEN_AI_ROLE.SYSTEM }));
}
