import { type Comic, type Panel, type Url } from '$lib/types';
import type { ChatResult } from '@openrouter/sdk/models';
import { randomUUID } from 'crypto';
import type { CreateImageResponse } from '../../../routes/api/chat/image/createImageApiTypes';
import { CreateImageSchema, InitialPanelsSchema, type InitialPanels } from './aiTypes';
import { chatWithImage, chat as openAiChat } from './sdk/openAi';
import { chat as openRouterChat } from './sdk/openRouter';
import { buildImageMessages, buildInitialMessages } from './utils/messages';

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

function getImageFromOpenAiResponse(response: unknown): CreateImageResponse {
	const image = response.output.find((item: any) => item.type === 'image_generation_call').result;
	const text = response.output
		.find((item: any) => item.type === 'message')
		.content.find(({ type }: any) => type === 'output_text').text;

	return { src: image, ...JSON.parse(text).data };
}

export async function createImage(scene: string, panel: Panel): Promise<CreateImageResponse> {
	const response = await chatWithImage(buildImageMessages(scene, panel), CreateImageSchema);

	const result = getImageFromOpenAiResponse(response);

	return result;
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
