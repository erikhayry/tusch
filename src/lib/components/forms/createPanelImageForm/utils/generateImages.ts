import { comicCommands, expectCommitted } from '$lib/features/comics/client/comic-commands';
import { getCharacter } from '$lib/features/comics/client/comic-selectors';
import { comicStore } from '$lib/features/comics/client/comic-store.svelte';
import type { CreatePanelImageResult } from '$lib/features/panels/contracts/createPanelImage';
import type { CharachterPositions, Crop, ResponsivePanelImage } from '$lib/types';
import { cropImage } from '$lib/utils/crop/crop';
import { generateId } from '$lib/utils/id';
import { getImageUrl, saveBase64Image, saveBlobImage } from '$lib/utils/storage/storage';

async function getPanelImage(image: ResponsivePanelImage): Promise<ResponsivePanelImage> {
	const panelImageFileName = await saveBase64Image(image.landscape.src);

	return {
		landscape: {
			src: panelImageFileName,
			width: image.landscape.width,
			height: image.landscape.height,
			characters: image.landscape.characters,
		},
		portrait: {
			src: panelImageFileName,
			width: image.landscape.width,
			height: image.landscape.height,
			characters: image.landscape.characters,
		},
		alt: image.alt,
	};
}

async function getCharacterFileName(image: ResponsivePanelImage, crop: Crop) {
	const url = await getImageUrl(image.landscape.src);
	const head = await cropImage(url, crop);

	return saveBlobImage(`${generateId()}.png`, head);
}

async function getCharacterImage(image: ResponsivePanelImage, crop: Crop) {
	return {
		src: await getCharacterFileName(image, crop),
		width: crop.width,
		height: crop.height,
	};
}

async function setCharacterImages(
	comicId: string,
	panelId: string,
	characters: CharachterPositions[],
	image: ResponsivePanelImage,
) {
	for (const character of characters) {
		if (!getCharacter(comicStore.comics, comicId, character.id)) continue;
		expectCommitted(
			comicCommands.addCharacterImage(comicId, character.id, {
				id: generateId(),
				panelId,
				head: await getCharacterImage(image, character.head),
				full: await getCharacterImage(image, character.full),
			}),
		);
	}
}

export async function genereateImages({ comicId, panelId, image }: CreatePanelImageResult) {
	const panelImage = await getPanelImage(image);
	expectCommitted(comicCommands.replacePanelImage(comicId, panelId, panelImage));
	setCharacterImages(comicId, panelId, image.landscape.characters || [], panelImage);
}
