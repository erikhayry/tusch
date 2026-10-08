import { COOKIE_NAME } from '$lib/utils/key';
import type { Cookies } from '@sveltejs/kit';
import OpenAI from 'openai';
import type { ResponseCreateParamsWithTools } from 'openai/lib/ResponsesParser.mjs';
import { OpenAiImageOutputSchema, type OpenAiImageOutput, type SchemaName } from '../aiTypes';
import { getSchemaAsTextFormat } from '../utils/format';
import { getChatMessages } from '../utils/messages';
import { MODEL, TOOLS } from '../utils/settings';

function getClient(cookies: Cookies): OpenAI {
	const apiKey = cookies.get(COOKIE_NAME);

	if (!apiKey) {
		throw new Error('Missing OpenAI API key in cookies');
	}

	return new OpenAI({ apiKey });
}

async function parse(
	client: OpenAI,
	req: ResponseCreateParamsWithTools,
): Promise<OpenAiImageOutput> {
	const response = await client.responses.parse(req);

	return OpenAiImageOutputSchema.parse(response);
}

export async function text(
	cookies: Cookies,
	messages: string[],
	schema: SchemaName,
): Promise<OpenAiImageOutput> {
	const client = getClient(cookies);
	const req: ResponseCreateParamsWithTools = {
		model: MODEL.TEXT,
		input: getChatMessages(messages),
		text: {
			format: getSchemaAsTextFormat(schema),
		},
	};

	return parse(client, req);
}

export async function image(
	cookies: Cookies,
	messages: string[],
	schema: SchemaName,
): Promise<OpenAiImageOutput> {
	const client = getClient(cookies);
	const req: ResponseCreateParamsWithTools = {
		model: MODEL.TEXT,
		input: getChatMessages(messages),
		tools: [TOOLS.IMAGE],
		store: true,
		include: [],
		text: {
			format: getSchemaAsTextFormat(schema),
		},
	};

	return parse(client, req);
}
