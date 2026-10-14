import { COOKIE_NAME } from '$lib/utils/key';
import type { Cookies } from '@sveltejs/kit';
import OpenAI from 'openai';
import type { ResponseCreateParamsWithTools } from 'openai/lib/ResponsesParser.mjs';
import { OpenAiImageOutputSchema, type OpenAiImageOutput, type SchemaName } from '../aiTypes';
import { getSchemaAsTextFormat } from '../utils/format';
import { getChatMessages, getImageMessages } from '../utils/messages';
import { IMAGE_SIZE, MODEL, TOOLS, type ImageSizeValue } from '../utils/settings';

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

export async function ping(cookies: Cookies): Promise<{
	status: boolean;
	message: string;
}> {
	const client = getClient(cookies);
	try {
		await client.models.list();
		return { status: true, message: 'API key is valid' };
	} catch (error) {
		if (error instanceof OpenAI.AuthenticationError) {
			return { status: false, message: 'API key is invalid or rejected (HTTP 401)' };
		}

		if (error instanceof OpenAI.PermissionDeniedError) {
			return { status: false, message: 'API key lacks permission (HTTP 403)' };
		}

		if (error instanceof OpenAI.APIConnectionError) {
			return { status: false, message: 'Could not connect to the API endpoint' };
		}

		if (error instanceof OpenAI.APIError) {
			return {
				status: false,
				message: `API request failed (HTTP ${error.status}): ${error.message}`,
			};
		}

		return {
			status: false,
			message: `Unexpected error: ${error instanceof Error ? error.message : String(error)}`,
		};
	}
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

export async function image({
	cookies,
	messages,
	schema,
	imageUrl,
	size = IMAGE_SIZE.PORTRAIT,
}: {
	cookies: Cookies;
	messages: string[];
	schema: SchemaName;
	imageUrl?: string;
	size: ImageSizeValue;
}): Promise<OpenAiImageOutput> {
	const client = getClient(cookies);
	const req: ResponseCreateParamsWithTools = {
		model: MODEL.TEXT,
		input: [...getChatMessages(messages), ...getImageMessages(imageUrl)],
		tools: [TOOLS.image(size)],
		store: true,
		include: [],
		text: {
			format: getSchemaAsTextFormat(schema),
		},
	};

	return parse(client, req);
}
