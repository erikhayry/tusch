import { type Comic } from '$lib/types';

export const NIRVANA: Comic = {
	id: '6dcbdd2b-a490-473f-bb50-fe7c894b8533',
	style: 'anime',
	source: 'https://sv.wikipedia.org/wiki/Nirvana_(musikgrupp)',
	title: 'EXMPALE: Nirvana: från Aberdeen till världsscenen',
	cover: {
		landscape: {
			src: '/examples/nirvana/1.png',
			width: 1024,
			height: 1536,
			characters: [
				{
					id: 'a13f10d2-7b86-4b5d-9b3e-42b2c9f865a1',
					head: {
						x: 194,
						y: 227,
						width: 145,
						height: 165,
					},
					full: {
						x: 65,
						y: 225,
						width: 560,
						height: 1090,
					},
				},
				{
					id: 'b79d4e36-2837-4f4a-9b9f-25d95cde6253',
					head: {
						x: 662,
						y: 92,
						width: 177,
						height: 203,
					},
					full: {
						x: 594,
						y: 92,
						width: 430,
						height: 1325,
					},
				},
			],
		},
		portrait: {
			src: '/examples/nirvana/1.png',
			width: 1024,
			height: 1536,
			characters: [
				{
					id: 'a13f10d2-7b86-4b5d-9b3e-42b2c9f865a1',
					head: {
						x: 194,
						y: 227,
						width: 145,
						height: 165,
					},
					full: {
						x: 65,
						y: 225,
						width: 560,
						height: 1090,
					},
				},
				{
					id: 'b79d4e36-2837-4f4a-9b9f-25d95cde6253',
					head: {
						x: 662,
						y: 92,
						width: 177,
						height: 203,
					},
					full: {
						x: 594,
						y: 92,
						width: 430,
						height: 1325,
					},
				},
			],
		},
		alt: 'I ett trångt övningsrum står två unga män och spelar elgitarr och bas. Den blonda mannen till vänster lutar sig fram över gitarren med blicken fäst på strängarna och ett koncentrerat uttryck. Den mycket långa, mörkhåriga mannen till höger spelar bas och ser uppmärksamt mot sin medspelare. Förstärkare, instrumentfodral och slingrande sladdar fyller rummet kring dem. Regn rinner över fönstret bakom dem; kallt dagsljus från fönstret blandas med varmt ljus från en taklampa. Bilden visar båda musikerna i helfigur i en medelvid komposition.',
	},
	characters: [
		{
			id: 'a13f10d2-7b86-4b5d-9b3e-42b2c9f865a1',
			name: 'Kurt Cobain',
			description: {
				apparentAge: 'ung vuxen i slutet av 1980-talet och början av 1990-talet',
				gender: 'man',
				ethnicityOrSpecies: 'vit amerikan',
				facialFeatures: {
					faceShape: 'smalt, mjukt kantigt ansikte',
					eyeColorAndShape: 'ljusa, något smala ögon',
					hairStyleAndColor: 'rufsigt, axellångt blont hår',
					facialHair: null,
					distinguishingMarks: null,
				},
				bodyType: 'smal',
				height: 'medellängd',
				defaultOutfit: {
					top: 'sliten randig tröja eller kofta över en enkel t-shirt',
					bottom: 'blekta jeans',
					footwear: 'slitna sneakers',
					accessories: ['elgitarr'],
				},
				masterVisualPrompt:
					'Ung vuxen vit amerikansk man, smal och medellång, smalt ansikte, ljusa ögon, rufsigt axellångt blont hår, sliten randig tröja eller kofta, blekta jeans och slitna sneakers, håller ofta en elgitarr',
			},
		},
		{
			id: 'b79d4e36-2837-4f4a-9b9f-25d95cde6253',
			name: 'Krist Novoselic',
			description: {
				apparentAge: 'ung vuxen i slutet av 1980-talet och början av 1990-talet',
				gender: 'man',
				ethnicityOrSpecies: 'kroatisk-amerikan',
				facialFeatures: {
					faceShape: 'avlångt ansikte',
					eyeColorAndShape: 'ljusa, något djupt sittande ögon',
					hairStyleAndColor: 'långt, rakt mörkbrunt hår',
					facialHair: null,
					distinguishingMarks: null,
				},
				bodyType: 'lång och smal',
				height: 'mycket lång',
				defaultOutfit: {
					top: 'enkel flanellskjorta eller mörk t-shirt',
					bottom: 'lösa jeans',
					footwear: 'enkla mörka kängor',
					accessories: ['basgitarr'],
				},
				masterVisualPrompt:
					'Ung vuxen kroatisk-amerikansk man, mycket lång och smal, avlångt ansikte, ljusa ögon, långt rakt mörkbrunt hår, enkel flanellskjorta eller mörk t-shirt, lösa jeans och mörka kängor, spelar basgitarr',
			},
		},
		{
			id: 'c6e3a1f8-5d92-4d20-8e76-1a04a70b3f42',
			name: 'Dave Grohl',
			description: {
				apparentAge: 'ung vuxen i början av 1990-talet',
				gender: 'man',
				ethnicityOrSpecies: 'vit amerikan',
				facialFeatures: {
					faceShape: 'oval med markerad käke',
					eyeColorAndShape: 'ljusa ögon',
					hairStyleAndColor: 'kort, rufsigt mörkbrunt hår',
					facialHair: null,
					distinguishingMarks: null,
				},
				bodyType: 'atletisk',
				height: 'lång',
				defaultOutfit: {
					top: 'mörk t-shirt',
					bottom: 'slitstarka jeans',
					footwear: 'mörka sneakers',
					accessories: ['trumstockar'],
				},
				masterVisualPrompt:
					'Ung vuxen vit amerikansk man, lång och atletisk, oval ansiktsform med markerad käke, ljusa ögon, kort rufsigt mörkbrunt hår, mörk t-shirt, slitstarka jeans och mörka sneakers, håller trumstockar',
			},
		},
	],
	panels: [
		{
			id: '1b5d0c66-131d-4a3e-a8f5-14584e8934c1',
			editorialTitle: 'Panel 1 editorialTitle',
			captions: [
				'Aberdeen, Washington. Kurt Cobain och Krist Novoselic börjar spela tillsammans och lägger grunden till ett band som så småningom får namnet Nirvana.',
			],
			dialogue: [
				{
					characterId: 'a13f10d2-7b86-4b5d-9b3e-42b2c9f865a1',
					text: 'Vi fortsätter tills låtarna låter som våra egna.',
				},
				{
					characterId: 'b79d4e36-2837-4f4a-9b9f-25d95cde6253',
					text: 'Då spelar vi dem högt.',
				},
			],
			visualDescription:
				'Kurt och Krist övar i ett enkelt, trångt rum med förstärkare, sladdar och instrument. De spelar med koncentration medan regnet strilar utanför fönstret.',
			place: 'Övningslokal i Aberdeen, Washington',
			season: 'autumn',
			timeOfDay: 'afternoon',
			year: 1987,
			image: {
				landscape: {
					src: '/examples/nirvana/1.png',
					width: 1024,
					height: 1536,
					characters: [
						{
							id: 'a13f10d2-7b86-4b5d-9b3e-42b2c9f865a1',
							head: {
								x: 194,
								y: 227,
								width: 145,
								height: 165,
							},
							full: {
								x: 65,
								y: 225,
								width: 560,
								height: 1090,
							},
						},
						{
							id: 'b79d4e36-2837-4f4a-9b9f-25d95cde6253',
							head: {
								x: 662,
								y: 92,
								width: 177,
								height: 203,
							},
							full: {
								x: 594,
								y: 92,
								width: 430,
								height: 1325,
							},
						},
					],
				},
				portrait: {
					src: '/examples/nirvana/1.png',
					width: 1024,
					height: 1536,
					characters: [
						{
							id: 'a13f10d2-7b86-4b5d-9b3e-42b2c9f865a1',
							head: {
								x: 194,
								y: 227,
								width: 145,
								height: 165,
							},
							full: {
								x: 65,
								y: 225,
								width: 560,
								height: 1090,
							},
						},
						{
							id: 'b79d4e36-2837-4f4a-9b9f-25d95cde6253',
							head: {
								x: 662,
								y: 92,
								width: 177,
								height: 203,
							},
							full: {
								x: 594,
								y: 92,
								width: 430,
								height: 1325,
							},
						},
					],
				},
				alt: 'I ett trångt övningsrum står två unga män och spelar elgitarr och bas. Den blonda mannen till vänster lutar sig fram över gitarren med blicken fäst på strängarna och ett koncentrerat uttryck. Den mycket långa, mörkhåriga mannen till höger spelar bas och ser uppmärksamt mot sin medspelare. Förstärkare, instrumentfodral och slingrande sladdar fyller rummet kring dem. Regn rinner över fönstret bakom dem; kallt dagsljus från fönstret blandas med varmt ljus från en taklampa. Bilden visar båda musikerna i helfigur i en medelvid komposition.',
			},
		},
		{
			id: '58a77ab8-39d6-4500-8d59-9e86af54d7d2',
			editorialTitle: 'Panel 2 editorialTitle',
			captions: [
				'Efter spelningar i den lokala musikscenen ger Nirvana ut debutalbumet Bleach på skivbolaget Sub Pop.',
			],
			dialogue: [
				{
					characterId: 'a13f10d2-7b86-4b5d-9b3e-42b2c9f865a1',
					text: 'Det är rått och enkelt. Det känns rätt.',
				},
				{
					characterId: 'b79d4e36-2837-4f4a-9b9f-25d95cde6253',
					text: 'Nu får låtarna lämna övningsrummet.',
				},
			],
			visualDescription:
				'Bandet står i ett litet skivbolagsrum med kartonger och vinylskivor. Kurt håller i ett exemplar av Bleach medan Krist står bredvid med basen över axeln.',
			place: 'Seattle, Washington',
			season: 'summer',
			timeOfDay: 'afternoon',
			year: 1989,
			image: {
				landscape: {
					src: '/examples/nirvana/2.png',
					width: 1024,
					height: 1536,
					characters: [
						{
							id: 'a13f10d2-7b86-4b5d-9b3e-42b2c9f865a1',
							head: {
								x: 287,
								y: 105,
								width: 181,
								height: 220,
							},
							full: {
								x: 115,
								y: 95,
								width: 438,
								height: 1415,
							},
						},
						{
							id: 'b79d4e36-2837-4f4a-9b9f-25d95cde6253',
							head: {
								x: 597,
								y: 30,
								width: 241,
								height: 260,
							},
							full: {
								x: 507,
								y: 25,
								width: 517,
								height: 1485,
							},
						},
					],
				},
				portrait: {
					src: '/examples/nirvana/2.png',
					width: 1024,
					height: 1536,
					characters: [
						{
							id: 'a13f10d2-7b86-4b5d-9b3e-42b2c9f865a1',
							head: {
								x: 287,
								y: 105,
								width: 181,
								height: 220,
							},
							full: {
								x: 115,
								y: 95,
								width: 438,
								height: 1415,
							},
						},
						{
							id: 'b79d4e36-2837-4f4a-9b9f-25d95cde6253',
							head: {
								x: 597,
								y: 30,
								width: 241,
								height: 260,
							},
							full: {
								x: 507,
								y: 25,
								width: 517,
								height: 1485,
							},
						},
					],
				},
				alt: 'I ett litet skivbolagsrum i Seattle står Kurt Cobain till vänster och håller en svartvit skivomslagsbild framför sig. Han tittar ned på den med ett lugnt, nöjt uttryck. Krist Novoselic står bredvid honom till höger, mycket längre, med en basgitarr över axeln och ett stilla leende riktat mot Kurt och omslaget. Kartonger, vinylskivor, skivbackar och ett skrivbord fyller rummet. Genom fönstret syns Seattles skyline i varmt eftermiddagsljus; ljuset faller in över personerna och rummet. Bildutsnittet visar dem från ungefär mitten av låren och uppåt, i en nära, ögonhöjdskomposition.',
			},
		},
		{
			id: 'e0dbad89-928a-4f7c-bfad-0c00d8b52c92',
			editorialTitle: 'Panel 3 editorialTitle',
			captions: [
				'År 1990 ansluter Dave Grohl som trummis. Den nya sättningen börjar arbeta fram nästa kapitel för bandet.',
			],
			dialogue: [
				{
					characterId: 'c6e3a1f8-5d92-4d20-8e76-1a04a70b3f42',
					text: 'Säg till när ni vill börja. Jag är redo.',
				},
				{
					characterId: 'b79d4e36-2837-4f4a-9b9f-25d95cde6253',
					text: 'Då kör vi från början.',
				},
			],
			visualDescription:
				'Dave sitter bakom trumsetet i replokalen, med Kurt och Krist framför sig. De testar ett intensivt komp; rummet vibrerar av ljud och energi.',
			place: 'Övningslokal i Seattle, Washington',
			season: 'autumn',
			timeOfDay: 'night',
			year: 1990,
			image: {
				landscape: {
					src: '/examples/nirvana/3.png',
					width: 1024,
					height: 1536,
					characters: [
						{
							id: 'a13f10d2-7b86-4b5d-9b3e-42b2c9f865a1',
							head: {
								x: 76,
								y: 231,
								width: 115,
								height: 135,
							},
							full: {
								x: 0,
								y: 211,
								width: 493,
								height: 1055,
							},
						},
						{
							id: 'b79d4e36-2837-4f4a-9b9f-25d95cde6253',
							head: {
								x: 777,
								y: 65,
								width: 145,
								height: 160,
							},
							full: {
								x: 621,
								y: 59,
								width: 403,
								height: 1375,
							},
						},
						{
							id: 'c6e3a1f8-5d92-4d20-8e76-1a04a70b3f42',
							head: {
								x: 462,
								y: 333,
								width: 112,
								height: 122,
							},
							full: {
								x: 355,
								y: 329,
								width: 302,
								height: 432,
							},
						},
					],
				},
				portrait: {
					src: '/examples/nirvana/3.png',
					width: 1024,
					height: 1536,
					characters: [
						{
							id: 'a13f10d2-7b86-4b5d-9b3e-42b2c9f865a1',
							head: {
								x: 76,
								y: 231,
								width: 115,
								height: 135,
							},
							full: {
								x: 0,
								y: 211,
								width: 493,
								height: 1055,
							},
						},
						{
							id: 'b79d4e36-2837-4f4a-9b9f-25d95cde6253',
							head: {
								x: 777,
								y: 65,
								width: 145,
								height: 160,
							},
							full: {
								x: 621,
								y: 59,
								width: 403,
								height: 1375,
							},
						},
						{
							id: 'c6e3a1f8-5d92-4d20-8e76-1a04a70b3f42',
							head: {
								x: 462,
								y: 333,
								width: 112,
								height: 122,
							},
							full: {
								x: 355,
								y: 329,
								width: 302,
								height: 432,
							},
						},
					],
				},
				alt: 'I en sliten övningslokal i Seattle en höstnatt 1990 sitter Dave bakom trumsetet längst bak i mitten, med trumstockarna lyfta och ett fokuserat, förväntansfullt uttryck. Kurt står till vänster i förgrunden med elgitarr, vänd mot Dave, medan Krist står till höger med basgitarr och lutar sig in i det intensiva kompet. Cymbalerna darrar och kablar och förstärkare ligger kring musikerna på trägolvet. Ett fönster bakom dem visar den mörka natten; varmt takljus blandas med kallt blått ljus från fönstret och framhäver deras silhuetter.',
			},
		},
	],
};
