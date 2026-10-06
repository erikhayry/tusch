import { type Comic, type Panel, type Url } from '$lib/types';
import { randomUUID } from 'crypto';
import type { CreateImageResponse } from '../../../routes/api/chat/image/createImageApiTypes';
import { SchemaName, type InitialPanels } from './aiTypes';
import { image, text } from './sdk/openAi';
import { buildImageMessages, buildInitialMessages } from './utils/messages';

function getPanelsFromOpenAiResponse(response: unknown): InitialPanels {
	//TODO: validate
	// TODO: use find instead of hardcoded index

	return JSON.parse(response.output[1].content[0].text as string).data;
}

export async function init(source: Url): Promise<Comic> {
	const response = await text(buildInitialMessages(source), SchemaName.enum.initComic);

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
	const response = await image(buildImageMessages(scene, panel), SchemaName.enum.createImage);

	const result = getImageFromOpenAiResponse(response);

	return result;
}
