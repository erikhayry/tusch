import {
	CreateComicResultSchema,
	type CreateComicResult,
	type CreateComicValues,
} from '$lib/features/comics/contracts/createComic';
import {
	CreateCoverImageResultSchema,
	toCoverPrompt,
	type CreateCoverImageResult,
	type CreateCoverImageValues,
} from '$lib/features/comics/contracts/createCoverImage';
import {
	CreatePanelResultSchema,
	type CreatePanelResult,
	type CreatePanelValues,
} from '$lib/features/panels/contracts/createPanel';
import {
	CreatePanelImageResultSchema,
	type CreatePanelImageResult,
	type CreatePanelImageValues,
} from '$lib/features/panels/contracts/createPanelImage';
import type { Comic, ResponsiveImage } from '$lib/types';
import {
	getComicFromOpenAiResponse,
	getImageFromOpenAiResponse,
	getPanelFromOpenAiResponse,
	hasImage,
} from '$lib/utils/ai/ai';
import {
	SchemaName,
	type AiImageRequest,
	type CreatedImage,
	type OpenAiOutput,
} from '$lib/utils/ai/aiTypes';
import {
	buildCoverImageMessages,
	buildInitialMessages,
	buildPanelImageMessages,
	buildPanelMessages,
} from '$lib/utils/ai/utils/messages';
import { IMAGE_SIZE } from '$lib/utils/ai/utils/settings';
import { INSTRUCTIONS_VALUE_KEY } from '$lib/utils/db/dbTypes';
import { generateId } from '$lib/utils/id';
import type { AiGateway, PingResult } from '../ai/ai-gateway';

/**
 * The provider answered, but not with something we can use. `code` tells the UI
 * which friendly message to show (`src/lib/forms/form-failure.ts`).
 */
export class InvalidAiResponseError extends Error {
	constructor(
		readonly code: 'ai_no_image' | 'invalid_ai_response',
		detail: string,
	) {
		super(`Invalid AI response: ${detail}`);
		this.name = 'InvalidAiResponseError';
	}
}

function interpret<T>(read: () => T): T {
	try {
		return read();
	} catch (error) {
		throw new InvalidAiResponseError(
			'invalid_ai_response',
			error instanceof Error ? error.message : String(error),
		);
	}
}

/**
 * The model sometimes answers without an image even when the tool is forced, and a
 * second request usually works, so an image request gets one retry (REQ-185-1).
 * Gateway errors aren't retried; they're handled by the caller.
 */
async function generateImage(gateway: AiGateway, request: AiImageRequest): Promise<OpenAiOutput> {
	const first = await gateway.image(request);
	if (hasImage(first)) return first;

	const second = await gateway.image(request);
	if (hasImage(second)) return second;

	throw new InvalidAiResponseError('ai_no_image', 'the response has no image');
}

/** Both orientations use the single generated image. */
function responsive(image: CreatedImage) {
	const copy = structuredClone(image);
	return { landscape: copy, portrait: copy, alt: copy.alt };
}

export function createGenerationService(gateway: AiGateway, createId: () => string = generateId) {
	async function createCoverImage({
		comic,
		instructions,
		globalInstructions,
		imageUrl,
		includeImage,
	}: CreateCoverImageValues): Promise<CreateCoverImageResult> {
		const output = await generateImage(gateway, {
			messages: [
				...buildCoverImageMessages({ comic, globalInstructions }),
				`USER INSTRUCTION: ${instructions}`,
			],
			schemaName: SchemaName.enum.createImage,
			size: IMAGE_SIZE.PORTRAIT,
			imageUrls: includeImage && imageUrl ? [imageUrl] : [],
		});

		return interpret(() =>
			CreateCoverImageResultSchema.parse({
				comicId: comic.id,
				image: responsive(getImageFromOpenAiResponse(output)),
				output: output.output,
			}),
		);
	}

	return {
		createCoverImage,

		async createComic({
			url,
			story,
			style,
			globalInstructions,
		}: CreateComicValues): Promise<CreateComicResult> {
			const output: OpenAiOutput = await gateway.text({
				messages: buildInitialMessages({ url, story }, style, globalInstructions),
				schemaName: SchemaName.enum.initComic,
			});

			const comic: Comic = interpret(() => {
				const initial = getComicFromOpenAiResponse(output);
				return {
					id: createId(),
					source: url,
					story,
					...initial,
					panels: initial.panels.map((panel) => ({ ...panel, id: createId() })),
				};
			});

			const cover: ResponsiveImage = (
				await createCoverImage({
					comic: toCoverPrompt(comic),
					[INSTRUCTIONS_VALUE_KEY]: '',
					globalInstructions,
				})
			).image;

			return interpret(() =>
				CreateComicResultSchema.parse({ comic: { ...comic, cover }, output: '' }),
			);
		},

		async createPanel({
			comicId,
			panels,
			index,
			globalInstructions,
		}: CreatePanelValues): Promise<CreatePanelResult> {
			const output = await gateway.text({
				messages: buildPanelMessages(index, panels, globalInstructions),
				schemaName: SchemaName.enum.createPanel,
			});

			return interpret(() =>
				CreatePanelResultSchema.parse({
					comicId,
					index,
					panel: getPanelFromOpenAiResponse(output),
					output: output.output,
				}),
			);
		},

		async createPanelImage({
			comicId,
			panel,
			characters,
			instructions,
			globalInstructions,
			style,
			includeImage,
			imageUrl,
			referenceImages,
		}: CreatePanelImageValues): Promise<CreatePanelImageResult> {
			const output = await generateImage(gateway, {
				messages: buildPanelImageMessages({
					panel,
					characters,
					instructions,
					globalInstructions,
					style,
				}),
				schemaName: SchemaName.enum.createImage,
				size: IMAGE_SIZE.PORTRAIT,
				imageUrls: [...(includeImage && imageUrl ? [imageUrl] : []), ...referenceImages],
			});

			return interpret(() =>
				CreatePanelImageResultSchema.parse({
					comicId,
					panelId: panel.id,
					image: responsive(getImageFromOpenAiResponse(output)),
					output: output.output,
				}),
			);
		},

		validateApiKey(): Promise<PingResult> {
			return gateway.ping();
		},
	};
}

export type GenerationService = ReturnType<typeof createGenerationService>;
