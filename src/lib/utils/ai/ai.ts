import {
	CreatedImageSchema,
	CreateImageSchema,
	CreatePanelSchema,
	InitialComicSchema,
	PingSchema,
	type CreatedImage,
	type CreateImage,
	type CreatePanel,
	type InitialComic,
	type OpenAiOutput,
	type Ping,
} from './aiTypes';

function getOutputText(response: OpenAiOutput): string | undefined {
	const content = response.output.find((item) => item.type === 'message')?.content;

	return content?.find(({ type }) => type === 'output_text')?.text;
}

function parseOutputText(response: OpenAiOutput): unknown | undefined {
	const text = getOutputText(response);

	return text ? JSON.parse(text).data : undefined;
}

export function getComicFromOpenAiResponse(response: OpenAiOutput): InitialComic {
	const output = parseOutputText(response);

	return InitialComicSchema.parse(output);
}

function getImageData(response: OpenAiOutput): CreateImage {
	const output = parseOutputText(response);

	return CreateImageSchema.parse(output);
}

export function getImageFromOpenAiResponse(response: OpenAiOutput): CreatedImage {
	const src = response.output.find((item) => item.type === 'image_generation_call')?.result;

	return CreatedImageSchema.parse({ src, ...getImageData(response) });
}

export function getPanelFromOpenAiResponse(response: OpenAiOutput): CreatePanel {
	const output = parseOutputText(response);

	return CreatePanelSchema.parse(output);
}

export function getPingResultFromOpenAiResponse(response: OpenAiOutput): Ping {
	const output = parseOutputText(response);

	return PingSchema.parse(output);
}
