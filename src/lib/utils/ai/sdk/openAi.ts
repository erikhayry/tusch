import OpenAI from 'openai';
import type { ResponseCreateParamsWithTools } from 'openai/lib/ResponsesParser.mjs';
import { OpenAiImageOutputSchema, type OpenAiImageOutput, type SchemaName } from '../aiTypes';
import { getSchemaAsTextFormat } from '../utils/format';
import { getChatMessages } from '../utils/messages';
import { MODEL, TOOLS } from '../utils/settings';

const client = new OpenAI({
	apiKey: import.meta.env.VITE_OPENAI_API_KEY,
});

async function parse(req: ResponseCreateParamsWithTools): Promise<OpenAiImageOutput> {
	const response = await client.responses.parse(req);

	return OpenAiImageOutputSchema.parse(response);
}

export async function text(messages: string[], schema: SchemaName): Promise<OpenAiImageOutput> {
	const req: ResponseCreateParamsWithTools = {
		model: MODEL.TEXT,
		input: getChatMessages(messages),
		text: {
			format: getSchemaAsTextFormat(schema),
		},
	};

	return parse(req);
}

export async function image(messages: string[], schema: SchemaName): Promise<OpenAiImageOutput> {
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

	return parse(req);
}
