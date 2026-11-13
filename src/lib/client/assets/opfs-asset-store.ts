import { generateId } from '$lib/utils/id';
import { deleteImage, getImageUrl, readImage, saveBlobImage } from '$lib/utils/storage/storage';
import type { AssetStore } from './asset-store';

// Example comics ship their images in static/ and reference them by URL path
// (`/examples/nirvana/1.png`). Assets the app creates are OPFS file names,
// which never start with '/'. Static assets are read over HTTP and never deleted.
const isStaticAsset = (assetId: string) => assetId.startsWith('/');

async function fetchStatic(assetId: string): Promise<Blob> {
	const response = await fetch(assetId);
	if (!response.ok) throw new Error(`Missing static asset ${assetId} (${response.status})`);
	return response.blob();
}

export const opfsAssetStore: AssetStore = {
	put: (blob, extension = 'webp') => saveBlobImage(`${generateId()}.${extension}`, blob),
	read: (assetId) => (isStaticAsset(assetId) ? fetchStatic(assetId) : readImage(assetId)),
	readUrl: (assetId) => (isStaticAsset(assetId) ? Promise.resolve(assetId) : getImageUrl(assetId)),
	delete: (assetId) => (isStaticAsset(assetId) ? Promise.resolve() : deleteImage(assetId)),
};
