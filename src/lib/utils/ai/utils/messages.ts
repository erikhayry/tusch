import type { CoverPrompt } from '#lib/features/comics/contracts/createCoverImage.ts';
import type { CharacterPrompt, PanelPrompt } from '#lib/features/comics/contracts/prompts.ts';
import type { CharacterBoxes } from '#lib/utils/ai/aiTypes.ts';
import { ComicStyleEnum, type ComicStyle, type Panel } from '#lib/types/index.ts';
import { STYLES } from '#lib/utils/comicStyles.ts';
import type { ResponseInputItem } from 'openai/resources/responses/responses.mjs';
import { OPEN_AI_ROLE, OPEN_AI_TYPE } from './settings';

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
	HOWS: [...GLOBAL_HOWS.PANEL, ...GLOBAL_HOWS.COMIC],
};

/** Start of the panel count line; the E2E mock reads the count from it. */
export const PANEL_COUNT_PREFIX = 'PANEL COUNT: Generate exactly ';

export const COVER_IMAGE = {
	WHAT: 'Generate a cover image for the comic based on the attached comic characters, panels, and style.',
	HOWS: [...GLOBAL_HOWS.IMAGE],
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

/** Standing user instructions; added after the built-in rules, nothing when empty. */
function buildGlobalInstructions(globalInstructions: string): string[] {
	return globalInstructions ? [`USER GLOBAL INSTRUCTIONS: ${globalInstructions}`] : [];
}

/**
 * A preset's rules, or the user's own description (REQ-97-3). The description replaces the
 * preset rules, so the model isn't given two styles to choose between.
 */
function buildStyleInstruction(styleKey: ComicStyle, customStyle: string | undefined): string[] {
	if (styleKey === ComicStyleEnum.enum.custom) {
		return [
			`MANDATORY CUSTOM STYLE: "${customStyle ?? ''}"`,
			'ENFORCEMENT: Apply this custom style strictly to the downstream image generator prompt string. DO NOT insert the style description or its keywords into "visualDescription" or "alt" fields.',
		];
	}

	const styleDef = STYLES[styleKey];
	if (!styleDef) {
		return [`STYLE PRESET: ${styleKey}`];
	}

	return [
		`MANDATORY MASTER PROMPT PREFIX: "${styleDef.masterStylePrompt}"`,
		`LINEWORK RULE: ${styleDef.linework}`,
		`COLORING RULE: ${styleDef.coloringStyle}`,
		`SHADING & LIGHTING RULE: ${styleDef.shadingAndLighting}`,
		`ALLOWED PALETTE: ${styleDef.palette.join(', ')}`,
		'ENFORCEMENT: Apply these style rules strictly to the downstream image generator prompt string. DO NOT insert any of these style rules or keywords into "visualDescription" or "alt" fields.',
		`STRICT STYLE LOCK PRESET: ${JSON.stringify(STYLES[styleKey])}`,
	];
}

export function buildInitialMessages(
	{ url, story, panelCount }: { url?: string; story?: string; panelCount: number },
	style: ComicStyle,
	customStyle: string | undefined,
	globalInstructions = '',
): string[] {
	return [
		INIT.WHAT,
		...(url ? [`Source URL: ${url}`] : []),
		...(story ? [`USER STORY: ${story}`] : []),
		...INIT.HOWS,
		`${PANEL_COUNT_PREFIX}${panelCount} sequential panels that form a cohesive narrative arc.`,
		...buildStyleInstruction(style, customStyle),
		...buildGlobalInstructions(globalInstructions),
	];
}

export function buildCoverImageMessages({
	comic,
	customStyle,
	globalInstructions = '',
}: {
	comic: CoverPrompt;
	customStyle?: string;
	globalInstructions?: string;
}): string[] {
	return [
		COVER_IMAGE.WHAT,
		...COVER_IMAGE.HOWS,
		...buildStyleInstruction(comic.style, customStyle),
		`CHARACTERS: ${JSON.stringify(comic.characters)}`,
		`PANELS: ${JSON.stringify(comic.panels)}`,
		...buildGlobalInstructions(globalInstructions),
	];
}

export function buildPanelImageMessages({
	panel,
	instructions,
	characters,
	style,
	customStyle,
	globalInstructions = '',
}: {
	panel: Pick<
		Panel,
		'visualDescription' | 'dialogue' | 'captions' | 'place' | 'year' | 'season' | 'timeOfDay'
	>;
	instructions: string;
	characters: CharacterPrompt[];
	style: ComicStyle;
	customStyle?: string;
	globalInstructions?: string;
}): string[] {
	const meta: string[] = [];

	if (panel.visualDescription) {
		meta.push(`Visual Description: ${panel.visualDescription}`);
	}
	if (panel.dialogue?.length) {
		const dialogText = panel.dialogue.map(({ text }) => text).join('. ');
		meta.push(`Dialogue context for emotion/acting: ${dialogText}`);
	}
	if (panel.captions?.length) {
		meta.push(`Scene mood/context: ${panel.captions.join('. ')}`);
	}
	if (panel.place) {
		meta.push(`Location: ${panel.place}`);
	}
	if (panel.year) {
		meta.push(`Year/Era setting: ${panel.year}`);
	}
	if (panel.season) {
		meta.push(`Season: ${panel.season}`);
	}
	if (panel.timeOfDay) {
		meta.push(`Time of day: ${panel.timeOfDay}`);
	}

	meta.push(`Characters in comic: ${JSON.stringify(characters)}`);

	return [
		IMAGE.WHAT,
		...meta,
		...IMAGE.HOWS,
		...buildStyleInstruction(style, customStyle),
		...buildGlobalInstructions(globalInstructions),
		`USER INSTRUCTION: ${instructions}`,
	];
}

/** Prefix of the hint line; the mock gateway reads the boxes back from it. */
export const CURRENT_BOXES_PREFIX = 'Current boxes, may be wrong: ';

export const FIX_CROP = {
	WHAT: 'Find one character in the attached comic panel image and return the pixel boxes of the head and of the full body.',
	HOWS: [
		'COORDINATES: Boxes are pixels of the attached image, origin at the top left. Every box MUST lie inside the image: x and y at least 0, x + width at most the image width, y + height at most the image height.',
		'HEAD: The head box covers the whole head, including hair.',
		'FULL BODY: The full box covers the whole body, from the top of the head to the feet.',
		'IDENTITY: Use the character description to tell the character apart from the others in the image.',
	],
};

export function buildFixCharacterCropMessages({
	character,
	width,
	height,
	current,
}: {
	character: CharacterPrompt;
	width: number;
	height: number;
	current?: CharacterBoxes;
}): string[] {
	return [
		FIX_CROP.WHAT,
		`Image size: ${width}x${height}`,
		`Character: ${JSON.stringify(character)}`,
		...(current ? [`${CURRENT_BOXES_PREFIX}${JSON.stringify(current)}`] : []),
		...FIX_CROP.HOWS,
	];
}

export function buildPanelMessages(
	index: number,
	panels: PanelPrompt[],
	globalInstructions = '',
): string[] {
	return [
		PANEL.WHAT,
		`Target insertion index: ${index}`,
		`Existing Panels Context: ${JSON.stringify(panels)}`,
		...PANEL.HOWS,
		...buildGlobalInstructions(globalInstructions),
	];
}

export function getChatMessages(messages: string[]): ResponseInputItem[] {
	return messages.map((message) => ({
		role: OPEN_AI_ROLE.SYSTEM,
		content: message,
	}));
}

export function getImageMessages(imageUrls: string[]): ResponseInputItem[] {
	if (imageUrls.length === 0) {
		return [];
	}

	return [
		{
			role: OPEN_AI_ROLE.USER,
			content: [
				{
					type: OPEN_AI_TYPE.TEXT,
					text: 'Use attached images as reference to user instruction',
				},
				...imageUrls.map((imageUrl) => ({
					type: OPEN_AI_TYPE.IMAGE,
					image_url: imageUrl,
					detail: 'auto' as const,
				})),
			],
		},
	];
}
