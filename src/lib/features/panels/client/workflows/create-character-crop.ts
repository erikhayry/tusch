import type { AssetStore } from '$lib/client/assets/asset-store';
import type { Crop } from '$lib/types';
import type { CropBlob } from './crop-adapter';

export interface CharacterCropDeps {
	assets: Pick<AssetStore, 'read'>;
	crop: CropBlob;
}

/** Crops a stored image without persisting the result (preview only). */
export async function createCharacterCrop(
	{ assets, crop }: CharacterCropDeps,
	{ image, crop: area }: { image: string; crop: Crop },
): Promise<Blob> {
	return crop(await assets.read(image), area);
}
