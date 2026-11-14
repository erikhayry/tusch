import type { InitialComic, OpenAiOutput } from '$lib/utils/ai/aiTypes';
import { MOCK_COVER_IMAGE_BASE64 } from './mockCoverImage';
import { MOCK_PANEL_IMAGE_BASE64 } from './mockPanelImage';

const COMIC_DATA: { data: InitialComic } = {
	data: {
		style: 'anime',
		title: 'Ådalshändelserna: Vägen till Lunde',
		characters: [
			{
				id: 'a3c916f0-539b-4ab5-86e3-8cc3f72b09f4',
				name: 'Arbetaren',
				description: {
					apparentAge: 'i 30-årsåldern',
					gender: 'man',
					ethnicityOrSpecies: 'svensk',
					facialFeatures: {
						faceShape: 'avlångt ansikte med markerad käke',
						eyeColorAndShape: 'gråblå, lätt insjunkna ögon',
						hairStyleAndColor: 'kort, rufsigt mörkbrunt hår',
						facialHair: 'kort skäggstubb',
						distinguishingMarks: 'liten ljus ärrlinje vid vänstra tinningen',
					},
					bodyType: 'senig och arbetad kropp',
					height: 'omkring 175 cm',
					defaultOutfit: {
						top: 'sliten mörkblå arbetsjacka över en grå skjorta',
						bottom: 'bruna arbetsbyxor med uppvikta fållar',
						footwear: 'mörka läderkängor',
						accessories: ['mörkgrå flat keps', 'röd halsduk'],
					},
					masterVisualPrompt:
						'STYLE LOCK: Modern Japanese TV anime production key visual, Kyoto Animation aesthetic, precise ultra-sharp 1px ink linework, 2-tone crisp cel-shading with hard shadow edges, clean solid color fills, hair rim lighting, vivid animation color palette, pristine digital anime art, absolute zero realistic photorealism, absolute zero oil paint texture. STRICT REQUIREMENT: ultra-sharp 1px ink vector outlines, uniform micro-linework, no sketchiness, no heavy brush weights. STRICT REQUIREMENT: 2-tone crisp cel shading, flat solid fill base, hard-edged shadow boundaries, zero blur gradients. STRICT REQUIREMENT: rim lighting on hair, high-contrast ambient key light, hard specular white highlights. ALLOWED PALETTE: saturated primary colors, vibrant pastels, clean white. Svensk arbetare i 30-årsåldern, senig kropp, avlångt ansikte, gråblå ögon, kort rufsigt mörkbrunt hår, skäggstubb, liten ärrlinje vid vänstra tinningen, sliten mörkblå arbetsjacka, grå skjorta, bruna arbetsbyxor, läderkängor, mörkgrå flat keps och röd halsduk.',
				},
				images: [],
			},
			{
				id: '8d5307a9-0215-4f7e-9c93-f13407d2b960',
				name: 'Den unga åskådaren',
				description: {
					apparentAge: 'omkring 20 år',
					gender: 'kvinna',
					ethnicityOrSpecies: 'svensk',
					facialFeatures: {
						faceShape: 'mjuk oval ansiktsform',
						eyeColorAndShape: 'stora hasselbruna ögon',
						hairStyleAndColor: 'kastanjebrunt hår i en lång fläta',
						facialHair: null,
						distinguishingMarks: 'fräknar över näsan',
					},
					bodyType: 'slank',
					height: 'omkring 165 cm',
					defaultOutfit: {
						top: 'ljusblå blus under en mörkgrön yllekappa',
						bottom: 'lång brun kjol',
						footwear: 'svarta snörkängor',
						accessories: ['vinröd huvudduk', 'liten tygväska'],
					},
					masterVisualPrompt:
						'STYLE LOCK: Modern Japanese TV anime production key visual, Kyoto Animation aesthetic, precise ultra-sharp 1px ink linework, 2-tone crisp cel-shading with hard shadow edges, clean solid color fills, hair rim lighting, vivid animation color palette, pristine digital anime art, absolute zero realistic photorealism, absolute zero oil paint texture. STRICT REQUIREMENT: ultra-sharp 1px ink vector outlines, uniform micro-linework, no sketchiness, no heavy brush weights. STRICT REQUIREMENT: 2-tone crisp cel shading, flat solid fill base, hard-edged shadow boundaries, zero blur gradients. STRICT REQUIREMENT: rim lighting on hair, high-contrast ambient key light, hard specular white highlights. ALLOWED PALETTE: saturated primary colors, vibrant pastels, clean white. Svensk ung kvinna omkring 20 år, slank, mjukt ovalt ansikte, stora hasselbruna ögon, kastanjebrunt hår i lång fläta, fräknar över näsan, ljusblå blus, mörkgrön yllekappa, lång brun kjol, svarta snörkängor, vinröd huvudduk och liten tygväska.',
				},
				images: [],
			},
			{
				id: '0a928c58-c171-438a-9783-16b174be9ff2',
				name: 'Soldaten',
				description: {
					apparentAge: 'i 20-årsåldern',
					gender: 'man',
					ethnicityOrSpecies: 'svensk',
					facialFeatures: {
						faceShape: 'smalt, kantigt ansikte',
						eyeColorAndShape: 'ljusblå ögon',
						hairStyleAndColor: 'kort ljust hår, delvis dolt under mössa',
						facialHair: null,
						distinguishingMarks: 'ingen tydlig markering',
					},
					bodyType: 'ung och spänstig',
					height: 'omkring 180 cm',
					defaultOutfit: {
						top: 'grågrön militärrock med hög krage',
						bottom: 'mörka militärbyxor',
						footwear: 'svarta marschkängor',
						accessories: ['militärmössa', 'läderremmar för utrustning', 'gevär'],
					},
					masterVisualPrompt:
						'STYLE LOCK: Modern Japanese TV anime production key visual, Kyoto Animation aesthetic, precise ultra-sharp 1px ink linework, 2-tone crisp cel-shading with hard shadow edges, clean solid color fills, hair rim lighting, vivid animation color palette, pristine digital anime art, absolute zero realistic photorealism, absolute zero oil paint texture. STRICT REQUIREMENT: ultra-sharp 1px ink vector outlines, uniform micro-linework, no sketchiness, no heavy brush weights. STRICT REQUIREMENT: 2-tone crisp cel shading, flat solid fill base, hard-edged shadow boundaries, zero blur gradients. STRICT REQUIREMENT: rim lighting on hair, high-contrast ambient key light, hard specular white highlights. ALLOWED PALETTE: saturated primary colors, vibrant pastels, clean white. Svensk soldat i 20-årsåldern, spänstig, smalt kantigt ansikte, ljusblå ögon, kort ljust hår under militärmössa, grågrön militärrock med hög krage, mörka militärbyxor, svarta marschkängor, läderremmar och gevär.',
				},
				images: [],
			},
		],
		panels: [
			{
				editorialTitle: '',
				captions: [
					'Ådalen, 14 maj 1931. En arbetskonflikt och användningen av strejkbrytare hade skärpt motsättningarna.',
					'Gestalterna och replikerna i berättelsen är fiktiva sammansättningar, inte historiska citat.',
				],
				dialogue: [
					{
						characterId: 'a3c916f0-539b-4ab5-86e3-8cc3f72b09f4',
						text: 'Vi går tillsammans. Vi vill att strejkbryteriet ska upphöra.',
					},
				],
				visualDescription:
					'Arbetaren står bland människor som samlats på en väg i Frånö. Han håller en enkel tygbanderoll medan andra demonstranter fyller vägen bakom honom. Den unga åskådaren står vid vägkanten med sin tygväska och ser allvarlig ut. Vårgrönska syns i dikeskanten.',
				place: 'Frånö, Ångermanland',
				season: 'spring',
				timeOfDay: 'morning',
				year: 1931,
				id: 'ad01f7ac-b88b-41dd-a94a-37bb307278fa',
			},
			{
				editorialTitle: '',
				captions: [
					'Demonstranter tågade mot Lunde för att protestera mot strejkbryteriet.',
					'Soldater hade kallats till området under den upptrappade konflikten.',
				],
				dialogue: [
					{
						characterId: '8d5307a9-0215-4f7e-9c93-f13407d2b960',
						text: 'Det är så många. Hela vägen är full.',
					},
					{
						characterId: 'a3c916f0-539b-4ab5-86e3-8cc3f72b09f4',
						text: 'Vi fortsätter framåt, lugnt och tillsammans.',
					},
				],
				visualDescription:
					'En lång procession rör sig längs landsvägen mot Lunde. Arbetaren går nära fronten med banderollen; den unga åskådaren följer längs kanten. Längre fram står soldater samlade tvärs över vägen. Träd och låga byggnader ramar in den öppna sträckan.',
				place: 'Vägen mellan Frånö och Lunde',
				season: 'spring',
				timeOfDay: 'afternoon',
				year: 1931,
				id: 'a2b4d1f0-99dd-4b3c-a15a-87a09ca294c8',
			},
			{
				editorialTitle: '',
				captions: [
					'Vid Lunde mötte demonstranterna en militär avspärrning.',
					'Spänningen växte när folkmassan och soldaterna stod mitt emot varandra.',
				],
				dialogue: [
					{
						characterId: '0a928c58-c171-438a-9783-16b174be9ff2',
						text: 'Stanna där.',
					},
					{
						characterId: 'a3c916f0-539b-4ab5-86e3-8cc3f72b09f4',
						text: 'Vi kom hit för att protestera. Ingen ska behöva bli skadad.',
					},
				],
				visualDescription:
					'Soldaten står i led med sitt gevär riktat nedåt, mellan demonstranterna och vägen vidare. Arbetaren håller ena handen höjd för att visa att han inte angriper. Bakom honom trängs människor tätt, medan den unga åskådaren stannat vid vägkanten. Ansiktena är spända och blickarna riktade mot soldaterna.',
				place: 'Lunde',
				season: 'spring',
				timeOfDay: 'afternoon',
				year: 1931,
				id: 'd13b6d9e-7ef6-4f79-81a6-f47811c30e6e',
			},
			{
				editorialTitle: '',
				captions: [
					'Soldaterna öppnade eld mot demonstrationen.',
					'Skotten bröt upp folkmassan och förvandlade protesten till en katastrof.',
				],
				dialogue: [
					{
						characterId: '8d5307a9-0215-4f7e-9c93-f13407d2b960',
						text: 'Ner!',
					},
					{
						characterId: 'a3c916f0-539b-4ab5-86e3-8cc3f72b09f4',
						text: 'Ta skydd!',
					},
				],
				visualDescription:
					'En plötslig mynningsblixt syns i soldatledet. Människor kastar sig åt sidan och söker skydd bakom vägkanten; en banderoll faller mot marken. Den unga åskådaren hukar sig med händerna över huvudet. Ingen skada visas närgånget.',
				place: 'Lunde',
				season: 'spring',
				timeOfDay: 'afternoon',
				year: 1931,
				id: 'be836f25-2c89-4632-8a06-94cd31d2917b',
			},
			{
				editorialTitle: '',
				captions: [
					'Fem människor dödades och fem skadades i skottlossningen.',
					'Bland de dödade fanns den unga Eira Söderberg.',
				],
				dialogue: [
					{
						characterId: '8d5307a9-0215-4f7e-9c93-f13407d2b960',
						text: 'Hjälp till här!',
					},
					{
						characterId: '8d5307a9-0215-4f7e-9c93-f13407d2b960',
						text: 'Vi måste få fram de skadade.',
					},
				],
				visualDescription:
					'Efter skotten hjälper människor skadade vid vägkanten. Arbetaren knäböjer bredvid en person som får stöd av andra; den unga åskådaren håller fram en tygbit för att hjälpa till. Soldaten står längre bak, stel och blek, med geväret sänkt. Scenen visar sorg och chock utan närgångna skador.',
				place: 'Lunde',
				season: 'spring',
				timeOfDay: 'afternoon',
				year: 1931,
				id: 'c28d3a73-c4ac-4c14-8ab1-50ea2d41bbee',
			},
			{
				editorialTitle: '',
				captions: [
					'Nyheten om skotten spreds snabbt och väckte starka reaktioner långt utanför Ådalen.',
					'Frågan om militärens roll i arbetskonflikter blev föremål för en omfattande samhällsdebatt.',
				],
				dialogue: [
					{
						characterId: '8d5307a9-0215-4f7e-9c93-f13407d2b960',
						text: 'Jag vet inte hur det kunde gå så här.',
					},
					{
						characterId: 'a3c916f0-539b-4ab5-86e3-8cc3f72b09f4',
						text: 'Det här får inte glömmas.',
					},
				],
				visualDescription:
					'I skymningen står de tre gestalterna på avstånd från den nu tomma vägen. Arbetaren håller den nedhängande banderollen; den unga åskådaren ser ned mot marken. Soldaten står ensam vid sidan av vägen, med sänkt blick. Ett fönster i närheten lyser varmt medan människor samlas längre bort.',
				place: 'Lunde',
				season: 'spring',
				timeOfDay: 'dusk',
				year: 1931,
				id: 'e49eaf9f-d754-482b-8511-038d119422c6',
			},
		],
	},
};

export const CREATE_COMIC_RESPONSE: OpenAiOutput = {
	output: [
		{
			type: 'reasoning',
			content: [],
		},
		{
			type: 'reasoning',
			content: [],
		},
		{
			type: 'reasoning',
			content: [],
		},
		{
			type: 'message',
			content: [
				{
					type: 'output_text',
					text: JSON.stringify(COMIC_DATA),
				},
			],
		},
	],
};

const IMAGE_RESPONSE_DATA = {
	data: {
		alt: 'mock alt text',
		width: 1024,
		height: 1536,
		characters: [
			{
				id: 'a3c916f0-539b-4ab5-86e3-8cc3f72b09f4',
				panelId: 'ad01f7ac-b88b-41dd-a94a-37bb307278fa',
				head: {
					x: 187,
					y: 83,
					width: 179,
					height: 202,
				},
				full: {
					x: 0,
					y: 72,
					width: 410,
					height: 1464,
				},
			},
			{
				id: '8d5307a9-0215-4f7e-9c93-f13407d2b960',
				panelId: 'ad01f7ac-b88b-41dd-a94a-37bb307278fa',
				head: {
					x: 387,
					y: 281,
					width: 165,
					height: 173,
				},
				full: {
					x: 350,
					y: 272,
					width: 290,
					height: 1118,
				},
			},
			{
				id: '0a928c58-c171-438a-9783-16b174be9ff2',
				panelId: 'ad01f7ac-b88b-41dd-a94a-37bb307278fa',
				head: {
					x: 832,
					y: 421,
					width: 101,
					height: 111,
				},
				full: {
					x: 755,
					y: 421,
					width: 210,
					height: 681,
				},
			},
		],
	},
};

export const CREATE_COVER_IMAGE_RESPONSE: OpenAiOutput = {
	output: [
		{
			type: 'reasoning',
			content: [],
		},
		{
			type: 'image_generation_call',
			result: MOCK_COVER_IMAGE_BASE64,
		},
		{
			type: 'reasoning',
			content: [],
		},
		{
			type: 'message',
			content: [
				{
					type: 'output_text',
					text: JSON.stringify(IMAGE_RESPONSE_DATA),
				},
			],
		},
	],
};

export const CREATE_PANEL_RESPONSE: OpenAiOutput = {
	output: [
		{
			type: 'reasoning',
			content: [],
		},
		{
			type: 'message',
			content: [
				{
					type: 'output_text',
					text: '{"data":{"editorialTitle":"","captions":["Ådalen, maj 1931. En arbetskonflikt hade skärpts kring strejkbryteriet.","Innan tåget gav sig av samlades människor för att protestera."],"dialogue":[{"characterId":"a3c916f0-539b-4ab5-86e3-8cc3f72b09f4","text":"Vi håller ihop och går lugnt."},{"characterId":"8d5307a9-0215-4f7e-9c93-f13407d2b960","text":"Ska jag följa med?"}],"visualDescription":"Vid en samlingsplats i Frånö gör sig människor redo att gå ut på vägen. Arbetaren håller en hoprullad tygbanderoll medan den unga åskådaren står intill med sin tygväska. Fler demonstranter ansluter i bakgrunden; stämningen är allvarlig men samlad. Vårgrönska kantar den öppna vägen.","place":"Frånö, Ångermanland","season":"spring","timeOfDay":"morning","year":1931,"id":"6b58b59b-4e28-4b8e-9e7b-e59515848e99"}}',
				},
			],
		},
	],
};

// Default character ids match example comic A (src/examples/example-complete.ts).
const PANEL_IMAGE_DATA = {
	data: {
		alt: 'mock alt text',
		width: 1024,
		height: 1536,
		characters: [
			{
				id: 'aaaaaaaa-0000-4000-8000-0000000000c1',
				panelId: 'ad01f7ac-b88b-41dd-a94a-37bb307278fa',
				head: {
					x: 190,
					y: 220,
					width: 170,
					height: 200,
				},
				full: {
					x: 32,
					y: 220,
					width: 445,
					height: 1290,
				},
			},
			{
				id: 'aaaaaaaa-0000-4000-8000-0000000000c2',
				panelId: 'ad01f7ac-b88b-41dd-a94a-37bb307278fa',
				head: {
					x: 810,
					y: 390,
					width: 190,
					height: 220,
				},
				full: {
					x: 740,
					y: 390,
					width: 284,
					height: 1020,
				},
			},
		],
	},
};

export const CREATE_PANEL_IMAGE_RESPONSE: OpenAiOutput = {
	output: [
		{
			type: 'reasoning',
			content: [],
		},
		{
			type: 'image_generation_call',
			result: MOCK_PANEL_IMAGE_BASE64,
		},
		{
			type: 'reasoning',
			content: [],
		},
		{
			type: 'message',
			content: [
				{
					type: 'output_text',
					text: JSON.stringify(PANEL_IMAGE_DATA),
				},
			],
		},
	],
};

/**
 * The panel image with crop positions for the given characters. A comic made
 * through the UI has its own character ids, so the canned ids alone would
 * produce no crops for it. The two canned positions are reused in turn.
 */
export function createPanelImageResponse(characterIds: string[]): OpenAiOutput {
	const positions = PANEL_IMAGE_DATA.data.characters;
	const data = {
		data: {
			...PANEL_IMAGE_DATA.data,
			characters: characterIds.map((id, index) => ({
				...positions[index % positions.length],
				id,
			})),
		},
	};

	return {
		output: CREATE_PANEL_IMAGE_RESPONSE.output.map((item) =>
			item.type === 'message'
				? { ...item, content: [{ type: 'output_text' as const, text: JSON.stringify(data) }] }
				: item,
		),
	};
}

export const MODELS_RESPONSE = {
	options: { method: 'get', path: '/models', __security: { bearerAuth: true } },
	response: {},
	body: { object: 'list', data: [[Object], [Object]] },
	data: [
		{
			id: 'gpt-6-luna',
			object: 'model',
			created: 1789406102,
			owned_by: 'system',
			shutdown_date: null,
		},
		{
			id: 'gpt-image-2.5-flare',
			object: 'model',
			created: 1788563147,
			owned_by: 'system',
			shutdown_date: null,
		},
	],
	object: 'list',
};
