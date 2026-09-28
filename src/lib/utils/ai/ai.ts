import type { InitialPanel, Url } from '$lib/types';
import { chat } from './sdk/openRouter';
import { aiInitialResponse } from './test/mockAiResponse';
import { buildInitialMessages } from './utils/messages';

export async function init(url: Url): Promise<InitialPanel[]> {
	const response = await chat(buildInitialMessages(url));

	return aiInitialResponse;
}
