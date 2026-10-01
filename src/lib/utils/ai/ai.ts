import { type Comic, type Url } from '$lib/types';
import type { ChatResult } from '@openrouter/sdk/models';
import { randomUUID } from 'crypto';
import { InitialPanelsSchema, type InitialPanels } from './aiTypes';
import { chat } from './sdk/openRouter';
import { buildInitialMessages } from './utils/messages';

function getPanels(response: ChatResult): InitialPanels {
	//TODO: validate
	return JSON.parse(response.choices[0].message.content as string).data;
}

export async function init(source: Url): Promise<Comic> {
	const response = await chat(buildInitialMessages(source), InitialPanelsSchema);

	return {
		id: randomUUID(),
		source,
		title: '',
		panels: getPanels(response).map((initialPanel) => ({
			id: randomUUID(),
			...initialPanel,
		})),
	};
}
