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
import { ImageVariantEnum, type PanelImageAsset } from '#lib/types/index.ts';
import { storedVariants } from '#lib/types/image-variants.ts';
import { cropCharacterImages, type CharacterCropDeps } from './character-crops';

export interface CreatedPanelImageVariantDeps extends AssetWorkflowDeps, CharacterCropDeps {
	commands: Pick<ComicCommands, 'setPanelImageVariant'>;
}

/**
 * Stores the one variant a "create missing variant" request made, next to the variant
 * the panel already has (REQ-279-1). Only a new portrait is the crop source, so only
 * it replaces the crops (REQ-279-3).
 */
export function commitCreatedPanelImageVariant(
	deps: CreatedPanelImageVariantDeps,
	{ comicId, panelId, image }: Pick<CreatePanelImageResult, 'comicId' | 'panelId' | 'image'>,
): Promise<WorkflowResult> {
	return runAssetWorkflow(deps, async (stage) => {
		const panel = getPanel(deps.store.comics, comicId, panelId);
		if (!panel) {
			return {
				ok: false,
				code: CommandFailureCodes['panel-not-found'],
				message: `Panel ${panelId} not found`,
			};
		}
		if (!panel.image) {
			return {
				ok: false,
				code: CommandFailureCodes['image-not-found'],
				message: `Panel ${panelId} has no image to add a variant to`,
			};
		}

		const created = storedVariants(image)[0];
		if (!created) {
			return {
				ok: false,
				code: CommandFailureCodes['image-not-found'],
				message: `Panel ${panelId} has no image`,
			};
		}

		const blob = base64ImageToBlob(created.asset.src);
		const asset: PanelImageAsset = {
			src: await stage(blob),
			width: created.asset.width,
			height: created.asset.height,
			characters: created.asset.characters ?? [],
		};
		const cropImages =
			created.variant === ImageVariantEnum.enum.portrait
				? await cropCharacterImages(
						deps,
						stage,
						comicId,
						panelId,
						blob,
						created.asset.characters ?? [],
					)
				: undefined;

		return () =>
			deps.commands.setPanelImageVariant(comicId, panelId, created.variant, asset, cropImages);
	});
}
