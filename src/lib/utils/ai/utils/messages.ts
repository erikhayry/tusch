import type { ComicStyle, Panel } from '$lib/types';
import { STYLES } from '$lib/utils/comicStyles';
import { OPEN_AI_ROLE } from './settings';

const GLOBAL_HOWS = {
	PANEL: [
		'OUTPUT LANGUAGE: The output language MUST strictly match the primary language of the source text.',
		'YEAR MATCHING: You MUST ALWAYS include the "year" field in the response. It must accurately reflect the time period/year setting of the panel (e.g. 1931). Never omit or default the year unless historically indeterminate.',
		'CHARACTER LINKING: Whenever a main character speaks or acts in dialogue, set "characterId" to their exact matching UUID from the comic\'s "characters" array. Do NOT invent new IDs or leave it null if the speaker exists in the characters list.',
	],
	COMIC: [
		'NO ART STYLE IN DESCRIPTIONS: Visual descriptions ("visualDescription") and alt text MUST NEVER include art style terminology, medium references, rendering techniques, or preset names (e.g., DO NOT write "in anime style", "cel-shaded", "comic book art", "watercolor", "inked lines"). Describe ONLY pure scene content: subject matter, actions, spatial layout, lighting conditions, character expressions, and physical props.',
		'CHARACTERS: Define 1 to 3 primary characters with detailed visual traits (facial features, hair, signature clothing) and add them to the comic\'s "characters" array.',
	],
	IMAGE: [
		'STRICT ART STYLE SEPARATION: Keep art style instructions completely separate from scene descriptions. The "visualDescription" / "alt" text is used directly for screen reader alt text and must remain 100% style-agnostic.',
		'PURE ALT TEXT / DESCRIPTION: The "alt" field and "visualDescription" MUST contain ONLY subject matter, character poses, facial expressions, camera composition, environment layout, and lighting. NEVER mention style presets, rendering engines, ink styles, or medium names in alt text.',
		'NO TEXT IN IMAGE: Do NOT include any speech bubbles, dialogue, captions, logos, or written text inside the rendered visual output.',
		'NO BORDERS: Do NOT render outer panel frames, gutter borders, or multi-panel splits. Output a clean, single-frame scene.',
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
	HOWS: [...GLOBAL_HOWS.IMAGE],
};

export const PANEL = {
	WHAT: 'Insert a new comic panel script into an existing comic sequence.',
	HOWS: [
		'INDEX INSERTION: The panel must be inserted at the exact 0-based array index provided. Subsequent panels will shift right.',
		'CONTINUITY: Cross-reference surrounding panels (previous and next) to maintain logical visual continuity, tone, and character positioning.',
		...GLOBAL_HOWS.PANEL,
	],
};

function buildStyleInstruction(styleKey: ComicStyle): string[] {
	const styleDef = STYLES[styleKey];
	if (!styleDef) {
		return [`STYLE PRESET: ${styleKey}`];
	}

	return [
		`STRICT STYLE LOCK PRESET: ${styleDef.id.toUpperCase()}`,
		`MANDATORY MASTER PROMPT PREFIX: "${styleDef.masterStylePrompt}"`,
		`LINEWORK RULE: ${styleDef.linework}`,
		`COLORING RULE: ${styleDef.coloringStyle}`,
		`SHADING & LIGHTING RULE: ${styleDef.shadingAndLighting}`,
		`ALLOWED PALETTE: ${styleDef.palette.join(', ')}`,
		'ENFORCEMENT: Apply these style rules strictly to the downstream image generator prompt string. DO NOT insert any of these style rules or keywords into "visualDescription" or "alt" fields.',
	];
}

export function buildInitialMessages(url: string, style: ComicStyle): string[] {
	return [INIT.WHAT, `Source URL: ${url}`, ...INIT.HOWS, ...buildStyleInstruction(style)];
}

export function buildImageMessages({
	panel,
	instruction,
	style,
}: {
	panel: Panel;
	instruction: string;
	style: ComicStyle;
}): string[] {
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

	return [
		IMAGE.WHAT,
		...meta,
		...IMAGE.HOWS,
		...buildStyleInstruction(style),
		`USER INSTRUCTION: ${instruction}`,
	];
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
