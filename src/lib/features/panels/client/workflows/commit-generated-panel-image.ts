import type { ComicCommands } from '$lib/features/comics/client/comic-commands';
import { getCharacter, getPanel } from '$lib/features/comics/client/comic-selectors';
import {
	base64ImageToBlob,
	runAssetWorkflow,
	type AssetWorkflowDeps,
	type WorkflowResult,
} from '$lib/features/comics/client/workflows/asset-workflow';
import type { CreatePanelImageResult } from '$lib/features/panels/contracts/createPanelImage';
import type { CharacterImage, Crop, ResponsivePanelImage } from '$lib/types';
import type { CropBlob } from './crop-adapter';

export interface PanelImageWorkflowDeps extends AssetWorkflowDeps {
	commands: Pick<ComicCommands, 'commitPanelImage'>;
	crop: CropBlob;
	createId: () => string;
}

/**
 * Canonical panel-image processing: stores the main image, crops and stores
 * head/full images for every known character, then commits everything once.
 */
export function commitGeneratedPanelImage(
	deps: PanelImageWorkflowDeps,
	{ comicId, panelId, image }: Pick<CreatePanelImageResult, 'comicId' | 'panelId' | 'image'>,
): Promise<WorkflowResult> {
	return runAssetWorkflow(deps, async (stage) => {
		if (!getPanel(deps.store.comics, comicId, panelId)) {
			return { ok: false, code: 'panel-not-found', message: `Panel ${panelId} not found` };
		}

		const source = base64ImageToBlob(image.landscape.src);
		const src = await stage(source);
		const { width, height, characters = [] } = image.landscape;
		const panelImage: ResponsivePanelImage = {
			// Both orientations reference the single generated (landscape) file.
			landscape: { src, width, height, characters },
			portrait: { src, width, height, characters },
			alt: image.alt,
		};

		const storeCrop = async (area: Crop) => ({
			src: await stage(await deps.crop(source, area), 'webp'),
			width: area.width,
			height: area.height,
		});

		const characterImages: { characterId: string; image: CharacterImage }[] = [];
		for (const character of characters) {
			// The model can reference characters that are not in this comic; skip those crops.
			if (!getCharacter(deps.store.comics, comicId, character.id)) continue;

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

		return () => deps.commands.commitPanelImage(comicId, panelId, panelImage, characterImages);
	});
}
