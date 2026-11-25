import {
	PresetStyleEnum,
	type ComicStyleDescription,
	type PresetComicStyle,
} from '#lib/types/index.ts';
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

// The prompts describe technique only (line, colour, shading, palette). They name no living
// artist, studio or brand, so the prompt stays about how the image looks.
export const MANGA_STYLE: ComicStyleDescription = {
	id: 'manga',
	linework:
		'STRICT REQUIREMENT: clean black ink lines with varied line weight, crisp contours, expressive hatching',
	coloringStyle:
		'STRICT REQUIREMENT: pure black and white, no colour, screentone dot patterns for mid-tones, speed lines for motion',
	shadingAndLighting:
		'STRICT REQUIREMENT: high-contrast solid black shadow masses, white highlights, shading built from screentone dots',
	palette: ['monochrome black and white', 'grey screentone'],
	masterStylePrompt:
		'STYLE LOCK: Japanese manga page art, black and white ink drawing, screentone dot shading, speed lines for motion, bold expressive linework, high-contrast solid black masses, absolute zero colour, absolute zero photorealism, absolute zero 3D render effects',
};

export const NOIR_STYLE: ComicStyleDescription = {
	id: 'noir',
	linework: 'STRICT REQUIREMENT: confident heavy ink lines, rough edges, simple bold silhouettes',
	coloringStyle: 'STRICT REQUIREMENT: black and white only, grey wash tones, no colour',
	shadingAndLighting:
		'STRICT REQUIREMENT: deep heavy shadows, one hard light source, venetian blind light stripes, long cast shadows',
	palette: ['monochrome', 'deep black', 'smoky grey', 'stark white'],
	masterStylePrompt:
		'STYLE LOCK: film noir inspired black and white illustration, hard single key light, deep cast shadows, venetian blind light patterns, smoky atmosphere, heavy ink blacks, rough ink linework, absolute zero colour, absolute zero bright flat lighting',
};

export const NEWSPAPER_STRIP_STYLE: ComicStyleDescription = {
	id: 'newspaper-strip',
	linework:
		'STRICT REQUIREMENT: simple uniform clean lines, minimal detail, clear readable silhouettes',
	coloringStyle:
		'STRICT REQUIREMENT: bright flat colour fills, no gradients, limited palette of four to six colours',
	shadingAndLighting: 'STRICT REQUIREMENT: no shading, no shadows, even flat lighting',
	palette: ['bright flat primary colours', 'newsprint off-white', 'simple black outlines'],
	masterStylePrompt:
		'STYLE LOCK: mid-century newspaper comic strip panel, simple clean ink lines, bright flat colour fills, limited palette, no shading, no gradients, slightly off-white newsprint background, absolute zero painterly texture, absolute zero photorealism',
};

export const WATERCOLOUR_STYLE: ComicStyleDescription = {
	id: 'watercolour',
	linework:
		'STRICT REQUIREMENT: soft pencil linework visible under the paint, loose sketchy contours, no hard ink outlines',
	coloringStyle:
		'STRICT REQUIREMENT: transparent watercolour washes, soft bleeding edges, paper grain showing through, pale tones',
	shadingAndLighting:
		'STRICT REQUIREMENT: soft diffuse light, gentle layered washes for depth, no harsh shadows',
	palette: ['pale washes', 'soft pastel tones', 'warm cream paper'],
	masterStylePrompt:
		'STYLE LOCK: children picture book illustration, watercolour washes on cold-press paper, soft bleeding edges, visible pencil underdrawing, pale transparent colour, paper grain texture, gentle diffuse light, absolute zero hard outlines, absolute zero digital airbrush',
};

export const WEBTOON_STYLE: ComicStyleDescription = {
	id: 'webtoon',
	linework:
		'STRICT REQUIREMENT: clean smooth digital lines of even weight, crisp vector-like contours',
	coloringStyle:
		'STRICT REQUIREMENT: clean digital colour fills with soft gradients, smooth colour transitions',
	shadingAndLighting:
		'STRICT REQUIREMENT: soft gentle shading, subtle glow highlights, light ambient occlusion',
	palette: ['vivid digital colours', 'soft pastel accents', 'clean white'],
	masterStylePrompt:
		'STYLE LOCK: vertical scrolling webtoon panel art, clean digital line art, smooth digital colour fills, soft gentle shading, expressive character faces, bright clean palette, pristine digital finish, absolute zero paper texture, absolute zero film grain',
};

export const POP_ART_STYLE: ComicStyleDescription = {
	id: 'pop-art',
	linework:
		'STRICT REQUIREMENT: thick uniform black outlines, bold graphic contours, no sketch lines',
	coloringStyle:
		'STRICT REQUIREMENT: flat saturated colour blocks, large regular halftone dot pattern, loud contrasting colours',
	shadingAndLighting:
		'STRICT REQUIREMENT: no gradients, shading shown only by large dot patterns and flat colour blocks',
	palette: ['saturated primary red, yellow and blue', 'hot pink', 'black and white'],
	masterStylePrompt:
		'STYLE LOCK: 1960s pop art painting style, thick black graphic outlines, flat saturated colour blocks, large regular Ben-Day dot pattern, loud primary palette, bold graphic composition, absolute zero painterly brushstrokes, absolute zero smooth gradients',
};

export const UKIYO_E_STYLE: ComicStyleDescription = {
	id: 'ukiyo-e',
	linework:
		'STRICT REQUIREMENT: bold even black key lines with calligraphic brush-like contours, no sketching',
	coloringStyle:
		'STRICT REQUIREMENT: flat opaque colour areas, no gradients except soft bokashi shading in sky or water backgrounds',
	shadingAndLighting:
		'STRICT REQUIREMENT: no cast shadows, flat even lighting, depth shown only by layered flat planes',
	palette: ['indigo blue', 'vermilion red', 'muted ochre', 'soft green', 'paper cream'],
	masterStylePrompt:
		'STYLE LOCK: Japanese woodblock print style, bold calligraphic black key lines, flat opaque colour areas, layered flat planes, traditional woodblock paper texture, limited palette of indigo, vermilion and ochre, absolute zero 3D shading, absolute zero photorealism',
};

export const STYLES: Record<PresetComicStyle, ComicStyleDescription> = {
	[PresetStyleEnum.enum.anime]: ANIME_STYLE,
	[PresetStyleEnum.enum['classic-marvel']]: CLASSIC_MARVEL_STYLE,
	[PresetStyleEnum.enum['franco-belgian']]: FRANCO_BELGIAN_STYLE,
	[PresetStyleEnum.enum.manga]: MANGA_STYLE,
	[PresetStyleEnum.enum.noir]: NOIR_STYLE,
	[PresetStyleEnum.enum['newspaper-strip']]: NEWSPAPER_STRIP_STYLE,
	[PresetStyleEnum.enum.watercolour]: WATERCOLOUR_STYLE,
	[PresetStyleEnum.enum.webtoon]: WEBTOON_STYLE,
	[PresetStyleEnum.enum['pop-art']]: POP_ART_STYLE,
	[PresetStyleEnum.enum['ukiyo-e']]: UKIYO_E_STYLE,
};
