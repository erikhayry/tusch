import type { Panel } from '$lib/types';
import { OPEN_AI_ROLE } from './settings';

const GLOBAL_HOWS = {
	PANEL: [
		'OUTPUT LANGUAGE: The output language MUST strictly match the primary language of the source text.',
		'YEAR MATCHING: You MUST ALWAYS include the "year" field in the response. It must accurately reflect the time period/year setting of the panel (e.g. 1931). Never omit or default the year unless historically indeterminate.',
		'CHARACTER LINKING: Whenever a main character speaks or acts in dialogue, set "characterId" to their exact matching UUID from the comic\'s "characters" array. Do NOT invent new IDs or leave it null if the speaker exists in the characters list.',
	],
	COMIC: [
		'CHARACTERS: Define 1 to 3 primary characters with detailed visual traits (facial features, hair, signature clothing) and add them to the comic\'s "characters" array.',
	],
};

export const INIT = {
	WHAT: 'Create a structured comic script based on the attached URL and context.',
	HOWS: [
		...GLOBAL_HOWS.PANEL,
		...GLOBAL_HOWS.COMIC,
		'PANEL COUNT: Generate between 5 and 10 sequential panels that form a cohesive narrative arc.',
	],
};

export const IMAGE = {
	WHAT: 'Generate a detailed visual prompt and metadata for rendering a single comic panel image.',
	HOWS: [
		'NO TEXT IN IMAGE: Do NOT include any speech bubbles, dialogue, captions, logos, or written text inside the rendered visual output.',
		'NO BORDERS: Do NOT render outer panel frames, gutter borders, or multi-panel splits. Output a clean, single-frame scene.',
		'ALT TEXT: The "alt" field MUST strictly contain a pure visual description of the scene layout, characters, action, and lighting for screen readers.',
	],
};

export const PANEL = {
	WHAT: 'Insert a new comic panel script into an existing comic sequence.',
	HOWS: [
		'INDEX INSERTION: The panel must be inserted at the exact 0-based array index provided. Subsequent panels will shift right.',
		'CONTINUITY: Cross-reference surrounding panels (previous and next) to maintain logical visual continuity, tone, and character positioning.',
		...GLOBAL_HOWS.PANEL,
	],
};

export function buildInitialMessages(url: string): string[] {
	return [INIT.WHAT, `Source URL: ${url}`, ...INIT.HOWS];
}

export function buildImageMessages(panel: Panel, instruction: string): string[] {
	const meta: string[] = [];

	if (panel.visualDescription) meta.push(`Visual Description: ${panel.visualDescription}`);
	if (panel.dialogue?.length) {
		const dialogText = panel.dialogue.map(({ text }) => text).join('. ');
		meta.push(`Dialogue context for emotion/acting: ${dialogText}`);
	}
	if (panel.captions?.length) meta.push(`Scene mood/context: ${panel.captions.join('. ')}`);
	if (panel.place) meta.push(`Location: ${panel.place}`);
	if (panel.year) meta.push(`Year/Era setting: ${panel.year}`);
	if (panel.season) meta.push(`Season: ${panel.season}`);
	if (panel.timeOfDay) meta.push(`Time of day: ${panel.timeOfDay}`);

	return [IMAGE.WHAT, ...meta, ...IMAGE.HOWS, instruction];
}

function removeImage(panels: Panel[]) {
	return panels.map(({ image, ...panel }) => ({
		...panel,
		hasImage: Boolean(image),
	}));
}

export function buildPanelMessages(index: number, panels: Panel[]): string[] {
	return [
		PANEL.WHAT,
		`Target insertion index: ${index}`,
		`Existing Panels Context: ${JSON.stringify(removeImage(panels))}`,
		...PANEL.HOWS,
	];
}

export function getChatMessages(messages: string[]) {
	return messages.map((message) => ({
		content: message,
		role: OPEN_AI_ROLE.SYSTEM,
	}));
}
