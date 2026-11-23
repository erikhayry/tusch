import {
	CreateComicResultSchema,
	type CreateComicResult,
	type CreateComicValues,
} from '#lib/features/comics/contracts/createComic.ts';
import {
	CreateCoverImageResultSchema,
	toCoverPrompt,
	type CreateCoverImageResult,
	type CreateCoverImageValues,
} from '#lib/features/comics/contracts/createCoverImage.ts';
import {
	CreatePanelResultSchema,
	type CreatePanelResult,
	type CreatePanelValues,
} from '#lib/features/panels/contracts/createPanel.ts';
import {
	CreatePanelImageResultSchema,
	type CreatePanelImageResult,
	type CreatePanelImageValues,
} from '#lib/features/panels/contracts/createPanelImage.ts';
import {
	FixCharacterCropResultSchema,
	type FixCharacterCropResult,
	type FixCharacterCropValues,
} from '#lib/features/panels/contracts/fixCharacterCrop.ts';
import {
	ImageFormatEnum,
	type Comic,
	type Crop,
	type ImageFormat,
	type ImageVariant,
	ImageVariantEnum,
} from '#lib/types/index.ts';
import { variantsFor } from '#lib/types/image-variants.ts';
import {
	getCharacterBoxesFromOpenAiResponse,
	getComicFromOpenAiResponse,
	getImageFromOpenAiResponse,
	getPanelFromOpenAiResponse,
	hasImage,
} from '#lib/utils/ai/ai.ts';
import {
	SchemaName,
	type AiImageRequest,
	type CreatedImage,
	type OpenAiOutput,
} from '#lib/utils/ai/aiTypes.ts';
import {
	buildCoverImageMessages,
	buildFixCharacterCropMessages,
	buildInitialMessages,
	buildPanelImageMessages,
	buildPanelMessages,
} from '#lib/utils/ai/utils/messages.ts';
import { IMAGE_SIZE } from '#lib/utils/ai/utils/settings.ts';

/** The image size each variant is generated at (REQ-103-2). */
const VARIANT_SIZE: Record<ImageVariant, (typeof IMAGE_SIZE)[keyof typeof IMAGE_SIZE]> = {
	portrait: IMAGE_SIZE.PORTRAIT,
	landscape: IMAGE_SIZE.LANDSCAPE,
};
import { INSTRUCTIONS_VALUE_KEY } from '#lib/utils/db/dbTypes.ts';
import { generateId } from '#lib/utils/id.ts';
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
	if (hasImage(first)) {
		return first;
	}

	const second = await gateway.image(request);
	if (hasImage(second)) {
		return second;
	}

	throw new InvalidAiResponseError('ai_no_image', 'the response has no image');
}

/**
 * The crop is cut from the image in the browser, so a box outside the picture
 * would produce an empty or shifted crop. Whole pixels only, like the stored sizes.
 */
function isInsideImage(box: Crop, width: number, height: number): boolean {
	return (
		[box.x, box.y, box.width, box.height].every(Number.isInteger) &&
		box.x >= 0 &&
		box.y >= 0 &&
		box.width > 0 &&
		box.height > 0 &&
		box.x + box.width <= width &&
		box.y + box.height <= height
	);
}

export function createGenerationService(gateway: AiGateway, createId: () => string = generateId) {
	/**
	 * One request per variant the format asks for. A failed variant doesn't stop the others
	 * (REQ-103-3). The landscape one is drawn from the portrait one so the two match; when
	 * only one variant is made, `existingImage` (the other variant) is the reference (REQ-279-1).
	 */
	async function generateVariants(
		format: ImageFormat,
		existingImage: string | undefined,
		request: (variant: ImageVariant, reference: string | undefined) => AiImageRequest,
	) {
		const generated: Partial<
			Record<ImageVariant, { image: CreatedImage; output: OpenAiOutput['output'] }>
		> = {};
		const failures: { variant: ImageVariant; cause: unknown }[] = [];

		for (const variant of variantsFor(format)) {
			try {
				const reference =
					variant === ImageVariantEnum.enum.landscape && generated.portrait
						? `data:image/webp;base64,${generated.portrait.image.src}`
						: existingImage;
				const output = await generateImage(gateway, request(variant, reference));
				generated[variant] = {
					image: interpret(() => getImageFromOpenAiResponse(output)),
					output: output.output,
				};
			} catch (cause) {
				failures.push({ variant, cause });
			}
		}

		const primary = generated.portrait ?? generated.landscape;
		if (!primary) {
			// Nothing to save: report the first failure as a single-request failure would be.
			throw failures[0]?.cause ?? new InvalidAiResponseError('ai_no_image', 'no image requested');
		}

		return {
			primary,
			variants: {
				portrait: generated.portrait?.image,
				landscape: generated.landscape?.image,
			},
			failedVariant: failures[0]?.variant,
		};
	}

	async function createCoverImage({
		comic,
		instructions,
		globalInstructions,
		imageUrl,
		includeImage,
		imageFormat = ImageFormatEnum.enum.both,
		existingImage,
	}: CreateCoverImageValues): Promise<CreateCoverImageResult> {
		const messages = [
			...buildCoverImageMessages({ comic, globalInstructions }),
			`USER INSTRUCTION: ${instructions}`,
		];
		const { primary, variants, failedVariant } = await generateVariants(
			imageFormat,
			existingImage,
			(variant, reference) => ({
				messages,
				schemaName: SchemaName.enum.createImage,
				size: VARIANT_SIZE[variant],
				imageUrls: [
					...(includeImage && imageUrl ? [imageUrl] : []),
					...(reference ? [reference] : []),
				],
			}),
		);

		return interpret(() =>
			CreateCoverImageResultSchema.parse({
				comicId: comic.id,
				image: { alt: primary.image.alt, ...variants },
				failedVariant,
				output: primary.output,
			}),
		);
	}

	return {
		createCoverImage,

		async createComic({
			url,
			story,
			style,
			panelCount,
			globalInstructions,
		}: CreateComicValues): Promise<CreateComicResult> {
			const output: OpenAiOutput = await gateway.text({
				messages: buildInitialMessages({ url, story, panelCount }, style, globalInstructions),
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

			// A comic gets the cover variants of the default format (REQ-006).
			const { image: cover, failedVariant } = await createCoverImage({
				comic: toCoverPrompt(comic),
				[INSTRUCTIONS_VALUE_KEY]: '',
				globalInstructions,
			});

			return interpret(() =>
				CreateComicResultSchema.parse({
					comic: { ...comic, cover },
					failedVariant,
					output: '',
				}),
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
			imageFormat = ImageFormatEnum.enum.both,
			existingImage,
		}: CreatePanelImageValues): Promise<CreatePanelImageResult> {
			const prompt = buildPanelImageMessages({
				panel,
				characters,
				instructions,
				globalInstructions,
				style,
			});
			const { primary, variants, failedVariant } = await generateVariants(
				imageFormat,
				existingImage,
				(variant, reference) => ({
					messages: prompt,
					schemaName: SchemaName.enum.createImage,
					size: VARIANT_SIZE[variant],
					imageUrls: [
						...(includeImage && imageUrl ? [imageUrl] : []),
						...referenceImages,
						...(reference ? [reference] : []),
					],
				}),
			);

			return interpret(() =>
				CreatePanelImageResultSchema.parse({
					comicId,
					panelId: panel.id,
					image: { alt: primary.image.alt, ...variants },
					failedVariant,
					output: primary.output,
				}),
			);
		},

		/** Asks for new boxes only; the client crops the stored panel image (REQ-219-1). */
		async fixCharacterCrop({
			comicId,
			panelId,
			characterId,
			characterImageId,
			character,
			image,
			width,
			height,
			current,
		}: FixCharacterCropValues): Promise<FixCharacterCropResult> {
			const output = await gateway.text({
				messages: buildFixCharacterCropMessages({ character, width, height, current }),
				schemaName: SchemaName.enum.fixCharacterCrop,
				imageUrls: [image],
			});

			const boxes = interpret(() => getCharacterBoxesFromOpenAiResponse(output));
			if (!isInsideImage(boxes.head, width, height) || !isInsideImage(boxes.full, width, height)) {
				throw new InvalidAiResponseError('invalid_ai_response', 'the boxes lie outside the image');
			}

			return interpret(() =>
				FixCharacterCropResultSchema.parse({
					comicId,
					panelId,
					characterId,
					characterImageId,
					...boxes,
				}),
			);
		},

		validateApiKey(): Promise<PingResult> {
			return gateway.ping();
		},
	};
}

export type GenerationService = ReturnType<typeof createGenerationService>;
