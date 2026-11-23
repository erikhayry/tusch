import {
	CommandFailureCodes,
	type ComicCommands,
} from '#lib/features/comics/client/comic-commands.ts';
import { getPanel } from '#lib/features/comics/client/comic-selectors.ts';
import {
	base64ImageToBlob,
	runAssetWorkflow,
	type AssetWorkflowDeps,
	type WorkflowResult,
} from '#lib/features/comics/client/workflows/asset-workflow.ts';
import type { CreatePanelImageResult } from '#lib/features/panels/contracts/createPanelImage.ts';
import type { ImageVariant, PanelImageAsset, ResponsivePanelImage } from '#lib/types/index.ts';
import { primaryVariant, storedVariants } from '#lib/types/image-variants.ts';
import { cropCharacterImages, type CharacterCropDeps } from './character-crops';

export interface PanelImageWorkflowDeps extends AssetWorkflowDeps, CharacterCropDeps {
	commands: Pick<ComicCommands, 'commitPanelImage'>;
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
			// Each variant keeps the boxes the model drew on its own pixels; crops use the primary's.
			stored[variant] = {
				src,
				width: asset.width,
				height: asset.height,
				characters: asset.characters ?? [],
			};
		}

		const characterImages = await cropCharacterImages(
			deps,
			stage,
			comicId,
			panelId,
			primaryBlob,
			primary.asset.characters ?? [],
		);

		const panelImage: ResponsivePanelImage = { ...stored, alt: image.alt };
		return () => deps.commands.commitPanelImage(comicId, panelId, panelImage, characterImages);
	});
}
