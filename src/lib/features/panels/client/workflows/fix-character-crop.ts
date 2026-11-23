import type { ComicCommands } from '#lib/features/comics/client/comic-commands.ts';
import { getPanel } from '#lib/features/comics/client/comic-selectors.ts';
import {
	runAssetWorkflow,
	type AssetWorkflowDeps,
	type WorkflowResult,
} from '#lib/features/comics/client/workflows/asset-workflow.ts';
import type { FixCharacterCropResult } from '../../contracts/fixCharacterCrop';
import type { Crop, ImageAsset } from '#lib/types/index.ts';
import { primaryVariant } from '#lib/types/image-variants.ts';
import type { CropBlob } from './crop-adapter';

export interface FixCharacterCropDeps extends AssetWorkflowDeps {
	commands: Pick<ComicCommands, 'fixCharacterCrop'>;
	crop: CropBlob;
}

/**
 * Crops the panel's current image at the boxes the AI returned and replaces both
 * crops of the character image in one commit. The crops it replaces stay as the
 * one undo step, so the asset cleanup only removes what is older than that.
 */
export function fixCharacterCrop(
	deps: FixCharacterCropDeps,
	{ comicId, panelId, characterId, characterImageId, head, full }: FixCharacterCropResult,
): Promise<WorkflowResult> {
	return runAssetWorkflow(deps, async (stage) => {
		const source = primaryVariant(getPanel(deps.store.comics, comicId, panelId)?.image)?.asset.src;
		if (!source) {
			return { ok: false, code: 'image-not-found', message: `Panel ${panelId} has no image` };
		}

		const image = await deps.assets.read(source);
		const storeCrop = async (area: Crop): Promise<ImageAsset> => ({
			src: await stage(await deps.crop(image, area), 'webp'),
			width: area.width,
			height: area.height,
		});

		const crops = { head: await storeCrop(head), full: await storeCrop(full) };
		return () => deps.commands.fixCharacterCrop(comicId, characterId, characterImageId, crops);
	});
}
