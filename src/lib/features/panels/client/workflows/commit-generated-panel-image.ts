import {
	CommandFailureCodes,
	type ComicCommands,
} from '#lib/features/comics/client/comic-commands.ts';
import { getCharacter, getPanel } from '#lib/features/comics/client/comic-selectors.ts';
import {
	base64ImageToBlob,
	runAssetWorkflow,
	type AssetWorkflowDeps,
	type WorkflowResult,
} from '#lib/features/comics/client/workflows/asset-workflow.ts';
import type { CreatePanelImageResult } from '#lib/features/panels/contracts/createPanelImage.ts';
import type {
	CharacterImage,
	Crop,
	ImageVariant,
	PanelImageAsset,
	ResponsivePanelImage,
} from '#lib/types/index.ts';
import { primaryVariant, storedVariants } from '#lib/types/image-variants.ts';
import type { CropBlob } from './crop-adapter';

export interface PanelImageWorkflowDeps extends AssetWorkflowDeps {
	commands: Pick<ComicCommands, 'commitPanelImage'>;
	crop: CropBlob;
	createId: () => string;
}

/**
 * Canonical panel-image processing: stores each generated variant, crops and stores
 * head/full images for every known character from the primary variant, then commits
 * everything once.
 */
export function commitGeneratedPanelImage(
	deps: PanelImageWorkflowDeps,
	{ comicId, panelId, image }: Pick<CreatePanelImageResult, 'comicId' | 'panelId' | 'image'>,
): Promise<WorkflowResult> {
	return runAssetWorkflow(deps, async (stage) => {
		if (!getPanel(deps.store.comics, comicId, panelId)) {
			return {
				ok: false,
				code: CommandFailureCodes['panel-not-found'],
				message: `Panel ${panelId} not found`,
			};
		}

		const primary = primaryVariant(image);
		if (!primary) {
			return {
				ok: false,
				code: CommandFailureCodes['image-not-found'],
				message: `Panel ${panelId} has no image`,
			};
		}

		const primaryBlob = base64ImageToBlob(primary.asset.src);
		const stored: Partial<Record<ImageVariant, PanelImageAsset>> = {};
		for (const { variant, asset } of storedVariants(image)) {
			const src = await stage(
				variant === primary.variant ? primaryBlob : base64ImageToBlob(asset.src),
			);
			// Only the primary variant's boxes match its pixels, so the others store none.
			stored[variant] =
				variant === primary.variant
					? { src, width: asset.width, height: asset.height, characters: asset.characters ?? [] }
					: { src, width: asset.width, height: asset.height };
		}

		const storeCrop = async (area: Crop) => ({
			src: await stage(await deps.crop(primaryBlob, area), 'webp'),
			width: area.width,
			height: area.height,
		});

		const characterImages: { characterId: string; image: CharacterImage }[] = [];
		for (const character of primary.asset.characters ?? []) {
			// The model can reference characters that are not in this comic; skip those crops.
			if (!getCharacter(deps.store.comics, comicId, character.id)) {
				continue;
			}

			characterImages.push({
				characterId: character.id,
				image: {
					id: deps.createId(),
					panelId,
					head: await storeCrop(character.head),
					full: await storeCrop(character.full),
				},
			});
		}

		const panelImage: ResponsivePanelImage = { ...stored, alt: image.alt };
		return () => deps.commands.commitPanelImage(comicId, panelId, panelImage, characterImages);
	});
}
