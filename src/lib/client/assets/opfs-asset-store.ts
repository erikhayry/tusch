import { generateId } from '$lib/utils/id';
import { deleteImage, getImageUrl, readImage, saveBlobImage } from '$lib/utils/storage/storage';
import type { AssetStore } from './asset-store';

export const opfsAssetStore: AssetStore = {
	put: (blob, extension = 'webp') => saveBlobImage(`${generateId()}.${extension}`, blob),
	read: (assetId) => readImage(assetId),
	readUrl: (assetId) => getImageUrl(assetId),
	delete: (assetId) => deleteImage(assetId),
};
