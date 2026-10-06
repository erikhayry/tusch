import type { Panel } from '$lib/types';
import { OPEN_AI_ROLE } from './settings';

const GLOBAL_HOWS = {
	PANEL: [
		'language should be same as source',
		'the year field in the response should be included and match the year of the panel (e.g. 2023 if the panel is situated in 2023)', //not followed
		'if a main charachter has a dialogue, reference the id from the comic charachters list',
	],
	COMIC: ['add 1-3 main charachters. Add each charachter to the comics charachter array'],
};

export const INIT = {
	WHAT: 'create a comic script from attached url and instructions',
	HOWS: [...GLOBAL_HOWS.PANEL, 'number of panels should be 5 to 10'],
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

export const PANEL = {
	WHAT: 'add a comic panel script',
	HOWS: [
		'use index where the panel should be added. The index pushes the panels towards the end of the array',
		'use the other panels as a reference to create the a panel that fits the other panels',
		...GLOBAL_HOWS.PANEL,
	],
};

export function buildInitialMessages(url: string): string[] {
	return [INIT.WHAT, url, ...INIT.HOWS];
}

export function buildImageMessages(panel: Panel): string[] {
	return [
		IMAGE.WHAT,
		`visualDescription: ${panel.visualDescription}`,
		`dialogue: ${panel.dialogue.map(({ text }) => text).join('. ')}`,
		`captions: ${panel.captions.join('. ')}`,
		`season: ${panel.season}`,
		`year: ${panel.year}`,
		`time of day: ${panel.timeOfDay}`,
		...IMAGE.HOWS,
	];
}

export function buildPanelMessages(index: number, panels: Panel[]): string[] {
	return [PANEL.WHAT, `index: ${index}`, `panels: ${JSON.stringify(panels)}`, ...PANEL.HOWS];
}

export function getChatMessages(messages: string[]) {
	return messages.map((message) => ({ content: message, role: OPEN_AI_ROLE.SYSTEM }));
}
