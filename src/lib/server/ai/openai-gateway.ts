import {
	OpenAiOutputSchema,
	type AiImageRequest,
	type AiTextRequest,
	type OpenAiOutput,
} from '$lib/utils/ai/aiTypes';
import { getSchemaAsTextFormat } from '$lib/utils/ai/utils/format';
import { getChatMessages, getImageMessages } from '$lib/utils/ai/utils/messages';
import { IMAGE_SIZE, TOOLS } from '$lib/utils/ai/utils/settings';
import OpenAI from 'openai';
import type { ResponseCreateParamsWithTools } from 'openai/lib/ResponsesParser.mjs';
import { AiGatewayError, type AiCredentials, type AiGateway } from './ai-gateway';

export function toAiGatewayError(error: unknown): AiGatewayError {
	if (error instanceof AiGatewayError) return error;
	if (error instanceof OpenAI.AuthenticationError) {
		return new AiGatewayError('auth', 'API key is invalid or rejected', 401);
	}
	if (error instanceof OpenAI.PermissionDeniedError) {
		return new AiGatewayError('permission', 'API key lacks permission', 403);
	}
	if (error instanceof OpenAI.RateLimitError) {
		return new AiGatewayError(
			'rate-limit',
			'AI provider rate limit reached, try again shortly',
			429,
		);
	}
	if (error instanceof OpenAI.APIConnectionError) {
		return new AiGatewayError('connection', 'Could not connect to the AI provider');
	}
	if (error instanceof OpenAI.APIError) {
		return new AiGatewayError(
			'upstream',
			`AI provider request failed (HTTP ${error.status}): ${error.message}`,
			error.status,
		);
	}

	return new AiGatewayError(
		'upstream',
		`AI provider request failed: ${error instanceof Error ? error.message : String(error)}`,
	);
}

export function createOpenAiGateway({ apiKey, textModel, imageModel }: AiCredentials): AiGateway {
	function client(): OpenAI {
		if (!apiKey) throw new AiGatewayError('missing-key', 'Add an OpenAI API key in Settings', 401);
		return new OpenAI({ apiKey });
	}

	async function parse(request: ResponseCreateParamsWithTools): Promise<OpenAiOutput> {
		try {
			return OpenAiOutputSchema.parse(await client().responses.parse(request));
		} catch (error) {
			throw toAiGatewayError(error);
		}
	}

	return {
		text: ({ messages, schemaName }: AiTextRequest) =>
			parse({
				model: textModel,
				input: getChatMessages(messages),
				text: { format: getSchemaAsTextFormat(schemaName) },
			}),

		image: ({ messages, schemaName, imageUrl, size = IMAGE_SIZE.PORTRAIT }: AiImageRequest) =>
			parse({
				model: textModel,
				input: [...getChatMessages(messages), ...getImageMessages(imageUrl)],
				tools: [TOOLS.image(size, imageModel || '')],
				store: true,
				include: [],
				text: { format: getSchemaAsTextFormat(schemaName) },
			}),

		async ping() {
			try {
				await client().models.list();
				return { success: true, message: 'API key is valid' };
			} catch (error) {
				const failure = toAiGatewayError(error);
				if (failure.kind === 'rate-limit') throw failure;
				return { success: false, message: failure.message };
			}
		},

		async models() {
			try {
				const list = await client().models.list();
				return list.data.map(({ id }) => id);
			} catch (error) {
				throw toAiGatewayError(error);
			}
		},
	};
}
