import {
	CommandFailureCodes,
	type ComicCommands,
} from '#lib/features/comics/client/comic-commands.ts';
import { getPanel } from '#lib/features/comics/client/comic-selectors.ts';
import {
	runAssetWorkflow,
	type AssetWorkflowDeps,
	type WorkflowResult,
} from '#lib/features/comics/client/workflows/asset-workflow.ts';
import { primaryVariant, storedVariants } from '#lib/types/image-variants.ts';
import type { RemovePanelImageVariantValues } from '../../contracts/removePanelImageVariant';
import { cropCharacterImages, type CharacterCropDeps } from './character-crops';

export interface RemovePanelImageVariantDeps extends AssetWorkflowDeps, CharacterCropDeps {
	commands: Pick<ComicCommands, 'setPanelImageVariant'>;
}

/**
 * Removes one variant of a panel image that has two. Removing the portrait makes the
 * landscape the crop source, so the crops are cut again from it (REQ-279-3). The
 * removed file and the replaced crops go with the commit.
 */
export function removePanelImageVariant(
	deps: RemovePanelImageVariantDeps,
	{ comicId, panelId, variant }: RemovePanelImageVariantValues,
): Promise<WorkflowResult> {
	return runAssetWorkflow(deps, async (stage) => {
		const image = getPanel(deps.store.comics, comicId, panelId)?.image;
		const remaining = image
			? storedVariants(image).find((stored) => stored.variant !== variant)
			: undefined;
		if (!image || !image[variant] || !remaining) {
			return {
				ok: false,
				code: CommandFailureCodes['image-not-found'],
				message: `Panel ${panelId} has no ${variant} image to remove`,
			};
		}

		const cropsMove = primaryVariant(image)?.variant === variant;
		const cropImages = cropsMove
			? await cropCharacterImages(
					deps,
					stage,
					comicId,
					panelId,
					await deps.assets.read(remaining.asset.src),
					remaining.asset.characters ?? [],
				)
			: undefined;

		return () =>
			deps.commands.setPanelImageVariant(comicId, panelId, variant, undefined, cropImages);
	});
}
