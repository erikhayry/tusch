import { type Comic, type Panel, type Url } from '$lib/types';
import type { ChatResult } from '@openrouter/sdk/models';
import { randomUUID } from 'crypto';
import { chat } from './sdk/openRouter';
import { buildInitialMessages } from './utils/messages';

function getPanels(response: ChatResult): Panel[] {
	return JSON.parse(response.choices[0].message.content);
}

export async function init(source: Url): Promise<Comic> {
	const response = await chat(buildInitialMessages(source));

	return {
		id: randomUUID(),
		source,
		title: '',
		panels: getPanels(response),
	};
}
