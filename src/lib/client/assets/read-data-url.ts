import type { AssetStore } from './asset-store';

/** Reads an asset as a `data:` URL, e.g. to submit it as a form field. */
export async function readAssetDataUrl(
	assets: Pick<AssetStore, 'read'>,
	assetId: string,
): Promise<string> {
	const blob = await assets.read(assetId);

	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(reader.result as string);
		reader.onerror = () => reject(new Error('Failed to read file'));
		reader.readAsDataURL(blob);
	});
}
