import type { ComicStoreState } from '#lib/features/comics/client/comic-store.svelte.ts';
import { getCharacter } from '#lib/features/comics/client/comic-selectors.ts';
import type { Stage } from '#lib/features/comics/client/workflows/asset-workflow.ts';
import type { CharacterImage, PanelImageAsset } from '#lib/types/index.ts';
import type { CropBlob } from './crop-adapter';

export interface CharacterCropDeps {
	store: Pick<ComicStoreState, 'comics'>;
	crop: CropBlob;
	createId: () => string;
}

export type CharacterCrop = { characterId: string; image: CharacterImage };

type CharacterPosition = NonNullable<PanelImageAsset['characters']>[number];

/**
 * Crops every known character from one variant's own pixels, at that variant's boxes.
 * The model can reference characters that are not in this comic; those are skipped.
 */
export async function cropCharacterImages(
	deps: CharacterCropDeps,
	stage: Stage,
	comicId: string,
	panelId: string,
	source: Blob,
	characters: readonly CharacterPosition[],
): Promise<CharacterCrop[]> {
	const storeCrop = async (area: CharacterPosition['head']) => ({
		src: await stage(await deps.crop(source, area), 'webp'),
		width: area.width,
		height: area.height,
	});

	const crops: CharacterCrop[] = [];
	for (const character of characters) {
		if (!getCharacter(deps.store.comics, comicId, character.id)) {
			continue;
		}

		crops.push({
			characterId: character.id,
			image: {
				id: deps.createId(),
				panelId,
				head: await storeCrop(character.head),
				full: await storeCrop(character.full),
			},
		});
	}

	return crops;
}
