import { generateMocks } from '$lib/test/utils/generateMock';
import { InitialPanelsSchema } from '../aiTypes';

export const aiInitialResponse = generateMocks(InitialPanelsSchema, 3);

export const ContentJSONMock = {
	data: [
		{
			dialogue: ['Arbetare: Vi kräver bättre villkor och rätten att organisera oss.'],
			caption: 'Ådalen, Sverige – den 14 maj 1931. En vårdag som snart blir historisk.',
		},
		{
			dialogue: ['Ordförande: Låt våra röster höras!', 'Arbetare: Vi står enade!'],
			caption: 'Demonstrationen närmar sig platsen längs dalgångens väg.',
		},
		{
			dialogue: ['Officer: Håll avstånd, inga konfrontationer.', 'Soldat: Vi följer order.'],
			caption: 'Militär och polis står vid vägen; spänningen byggs upp.',
		},
		{
			dialogue: ['Arbetare: Skott!', 'En åskådare: Hjälp!'],
			caption: 'Skott hörs; panik och rädsla sprider sig bland åskådarna.',
		},
		{
			dialogue: ['Reporter: Fem döda och många skadade.', 'En överlevande: Varför sköts vi?'],
			caption: 'Fem människor dödas och flera skadas i tumultet.',
		},
		{
			dialogue: ['Domare: Utredningen fortsätter.', 'Advokat: Ansvar måste utkrävas.'],
			caption: 'Rättsliga utredningar och en nationell debatt följer.',
		},
		{
			dialogue: [
				'Arbetare: Minnet av dem som föll måste leva vidare.',
				'Politiker: Vi bygger ett bättre samhälle genom rättvisa och jämlikhet.',
			],
			caption:
				'Ådalen blir en vändpunkt i den svenska arbetarrörelsen – arbetsrätt och facklig organisering stärks.',
		},
	],
	title: 'Ådals händelserna – serietecknad lösning (fiktiv tolkning)',
};

export const mockOpenRouterResponse = {
	id: 'mock-gen-123',
	model: 'openai/gpt-5.2',
	choices: [
		{
			message: {
				role: 'assistant',
				content: JSON.stringify(ContentJSONMock),
			},
			finish_reason: 'stop',
		},
	],
};
