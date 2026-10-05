import { type Comic, type Url } from '$lib/types';
import type { ChatResult } from '@openrouter/sdk/models';
import { randomUUID } from 'crypto';
import { InitialPanelsSchema, type InitialPanels } from './aiTypes';
import { chat as openAiChat } from './sdk/openAi';
import { chat as openRouterChat } from './sdk/openRouter';
import { buildInitialMessages } from './utils/messages';

function getPanelsFromOpenAiResponse(response: unknown): InitialPanels {
	//TODO: validate
	// TODO: use find instead of hardcoded index

	return JSON.parse(response.output[1].content[0].text as string).data;
}

export async function initOpenAi(source: Url): Promise<Comic> {
	const response = await openAiChat(buildInitialMessages(source), InitialPanelsSchema);

	return {
		id: randomUUID(),
		source,
		title: '',
		panels: getPanelsFromOpenAiResponse(response).map((initialPanel) => ({
			id: randomUUID(),
			...initialPanel,
		})),
	};
}

function getPanelsFromOpenRouterResponse(response: ChatResult): InitialPanels {
	//TODO: validate
	return JSON.parse(response.choices[0].message.content as string).data;
}

export async function initOpenRouter(source: Url): Promise<Comic> {
	const response = await openRouterChat(buildInitialMessages(source), InitialPanelsSchema);

	return {
		id: randomUUID(),
		source,
		title: '',
		panels: getPanelsFromOpenRouterResponse(response).map((initialPanel) => ({
			id: randomUUID(),
			...initialPanel,
		})),
	};
}
