import {
	IMAGE_MODEL_COOKIE_NAME,
	KEY_COOKIE_NAME,
	TEXT_MODEL_COOKIE_NAME,
} from '$lib/utils/cookies';
import type { Cookies } from '@sveltejs/kit';
import OpenAI from 'openai';
import type { ResponseCreateParamsWithTools } from 'openai/lib/ResponsesParser.mjs';
import { OpenAiOutputSchema, type OpenAiOutput, type SchemaName } from '../aiTypes';
import { getSchemaAsTextFormat } from '../utils/format';
import { getChatMessages, getImageMessages } from '../utils/messages';
import { IMAGE_SIZE, TOOLS, type ImageSizeValue } from '../utils/settings';

export function asOpenAiOutput(output: Record<string, unknown>): OpenAiOutput {
	return {
		output: [
			{
				type: 'message',
				content: [
					{
						type: 'output_text',
						text: JSON.stringify(output),
					},
				],
			},
		],
	};
}

function getClient(cookies: Cookies): OpenAI {
	const apiKey = cookies.get(KEY_COOKIE_NAME);

	if (!apiKey) {
		throw new Error('Missing OpenAI API key in cookies');
	}

	return new OpenAI({ apiKey });
}

async function parse(client: OpenAI, req: ResponseCreateParamsWithTools): Promise<OpenAiOutput> {
	const response = await client.responses.parse(req);

	return OpenAiOutputSchema.parse(response);
}

export const PING_SUCCESS = { status: true, message: 'API key is valid' };

export async function ping(cookies: Cookies): Promise<OpenAiOutput> {
	const client = getClient(cookies);
	try {
		await client.models.list();
		return asOpenAiOutput(PING_SUCCESS);
	} catch (error) {
		if (error instanceof OpenAI.AuthenticationError) {
			return asOpenAiOutput({
				status: false,
				message: 'API key is invalid or rejected (HTTP 401)',
			});
		}

		if (error instanceof OpenAI.PermissionDeniedError) {
			return asOpenAiOutput({ status: false, message: 'API key lacks permission (HTTP 403)' });
		}

		if (error instanceof OpenAI.APIConnectionError) {
			return asOpenAiOutput({ status: false, message: 'Could not connect to the API endpoint' });
		}

		if (error instanceof OpenAI.APIError) {
			return asOpenAiOutput({
				status: false,
				message: `API request failed (HTTP ${error.status}): ${error.message}`,
			});
		}

		return asOpenAiOutput({
			status: false,
			message: `Unexpected error: ${error instanceof Error ? error.message : String(error)}`,
		});
	}
}

export async function text(
	cookies: Cookies,
	messages: string[],
	schemaName: SchemaName,
): Promise<OpenAiOutput> {
	const client = getClient(cookies);
	const req: ResponseCreateParamsWithTools = {
		model: cookies.get(TEXT_MODEL_COOKIE_NAME),
		input: getChatMessages(messages),
		text: {
			format: getSchemaAsTextFormat(schemaName),
		},
	};

	return parse(client, req);
}

export async function image({
	cookies,
	messages,
	schemaName,
	imageUrl,
	size = IMAGE_SIZE.PORTRAIT,
}: {
	cookies: Cookies;
	messages: string[];
	schemaName: SchemaName;
	imageUrl?: string;
	size: ImageSizeValue;
}): Promise<OpenAiOutput> {
	const client = getClient(cookies);

	const req: ResponseCreateParamsWithTools = {
		model: cookies.get(TEXT_MODEL_COOKIE_NAME),
		input: [...getChatMessages(messages), ...getImageMessages(imageUrl)],
		tools: [TOOLS.image(size, cookies.get(IMAGE_MODEL_COOKIE_NAME) || '')],
		store: true,
		include: [],
		text: {
			format: getSchemaAsTextFormat(schemaName),
		},
	};

	return parse(client, req);
}

export async function models(cookies: Cookies) {
	const client = getClient(cookies);

	return client.models.list();
}
