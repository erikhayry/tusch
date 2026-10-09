import { ComicStyleEnum, type Comic } from '$lib/types';

export const NIRVANA: Comic = {
	id: '6dcbdd2b-a490-473f-bb50-fe7c894b8533',
	style: ComicStyleEnum.enum.anime,
	source: 'https://sv.wikipedia.org/wiki/Nirvana_(musikgrupp)',
	title: 'EXMPALE: Nirvana: från Aberdeen till världsscenen',
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
				wide: {
					src: '/examples/nirvana/1.png',
					width: 1024,
					height: 1536,
				},
				narrow: {
					src: '/examples/nirvana/1.png',
					width: 1024,
					height: 1536,
				},
				alt: 'I ett trångt, dunkelt övningsrum står en långhårig blond gitarrist till vänster och en mörkhårig basist till höger, båda böjda koncentrerat över sina instrument. Ett trumset, förstärkare och slingrande kablar fyller rummet. Regn rinner längs fönstret bakom dem; kallt grått dagsljus blandas med varmt sken från en ensam glödlampa.',
			},
		},
		{
			id: '58a77ab8-39d6-4500-8d59-9e86af54d7d2',
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
				wide: {
					src: '/examples/nirvana/2.png',
					width: 1024,
					height: 1536,
				},
				narrow: {
					src: '/examples/nirvana/2.png',
					width: 1024,
					height: 1536,
				},
				alt: 'I ett trångt skivbolagsrum står en blond, långhårig musiker längst fram och håller upp ett svartvitt skivomslag utan text. En långhårig basist står tätt intill med basen över axeln, medan en tredje musiker syns bakom dem. Kartonger, vinylskivor och skivhyllor fyller rummet. Varmt eftermiddagsljus faller in genom fönstret och lyser upp scenen med en dämpad, jordnära ton.',
			},
		},
		{
			id: 'e0dbad89-928a-4f7c-bfad-0c00d8b52c92',
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
				wide: {
					src: '/examples/nirvana/3.png',
					width: 1024,
					height: 1536,
				},
				narrow: {
					src: '/examples/nirvana/3.png',
					width: 1024,
					height: 1536,
				},
				alt: 'I en mörk, sliten replokal står en långhårig gitarrist till vänster och en lång basist till höger, vända mot varandra medan de spelar. Bakom dem sitter en mörkhårig trummis vid ett stort trumset, med trumpinnarna i rörelse. Kablar och förstärkare fyller rummet; genom ett fönster syns nattligt regn. Ett varmt naket glödljus lyser över musikerna och kontrasterar mot rummets blå skuggor.',
			},
		},
	],
};
