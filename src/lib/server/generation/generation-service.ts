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
} from '$lib/utils/ai/ai';
import { SchemaName, type CreatedImage, type OpenAiOutput } from '$lib/utils/ai/aiTypes';
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

/** The provider answered, but not with something we can use. */
export class InvalidAiResponseError extends Error {
	constructor(cause: unknown) {
		super(`Invalid AI response: ${cause instanceof Error ? cause.message : String(cause)}`);
		this.name = 'InvalidAiResponseError';
	}
}

function interpret<T>(read: () => T): T {
	try {
		return read();
	} catch (error) {
		throw new InvalidAiResponseError(error);
	}
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
		const output = await gateway.image({
			messages: [
				...buildCoverImageMessages({ comic, globalInstructions }),
				`USER INSTRUCTION: ${instructions}`,
			],
			schemaName: SchemaName.enum.createImage,
			size: IMAGE_SIZE.PORTRAIT,
			imageUrl: includeImage ? imageUrl : undefined,
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
			style,
			globalInstructions,
		}: CreateComicValues): Promise<CreateComicResult> {
			const output: OpenAiOutput = await gateway.text({
				messages: buildInitialMessages(url, style, globalInstructions),
				schemaName: SchemaName.enum.initComic,
			});

			const comic: Comic = interpret(() => {
				const initial = getComicFromOpenAiResponse(output);
				return {
					id: createId(),
					source: url,
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
		}: CreatePanelImageValues): Promise<CreatePanelImageResult> {
			const output = await gateway.image({
				messages: buildPanelImageMessages({
					panel,
					characters,
					instructions,
					globalInstructions,
					style,
				}),
				schemaName: SchemaName.enum.createImage,
				size: IMAGE_SIZE.PORTRAIT,
				imageUrl: includeImage ? imageUrl : undefined,
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
