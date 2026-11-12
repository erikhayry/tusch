import type { AiImageRequest, AiTextRequest, OpenAiOutput } from '$lib/utils/ai/aiTypes';
import { z } from 'zod';

export const AiGatewayErrorKindSchema = z.enum([
	'missing-key',
	'auth',
	'permission',
	'rate-limit',
	'connection',
	'upstream',
]);
export type AiGatewayErrorKind = z.infer<typeof AiGatewayErrorKindSchema>;

/** A provider failure, normalised so callers never depend on a provider SDK's error types. */
export class AiGatewayError extends Error {
	constructor(
		readonly kind: AiGatewayErrorKind,
		message: string,
		readonly status?: number,
	) {
		super(message);
		this.name = 'AiGatewayError';
	}
}

export const AiCredentialsSchema = z.object({
	apiKey: z.string().optional(),
	textModel: z.string().optional(),
	imageModel: z.string().optional(),
});
export type AiCredentials = z.infer<typeof AiCredentialsSchema>;

export const PingResultSchema = z.object({
	success: z.boolean(),
	message: z.string(),
});
export type PingResult = z.infer<typeof PingResultSchema>;

/** Provider-neutral boundary for every AI call the server makes. */
export interface AiGateway {
	text(request: AiTextRequest): Promise<OpenAiOutput>;
	image(request: AiImageRequest): Promise<OpenAiOutput>;
	/** Checks the credentials. Expected rejections resolve with `success: false`. */
	ping(): Promise<PingResult>;
	models(): Promise<string[]>;
}
