import type { AssetStore } from '../asset-store';

export function fakeAssetStore(
	options: { failPutAt?: number; failDelete?: string[]; initial?: string[] } = {},
) {
	const files = new Map<string, Blob>((options.initial ?? []).map((id) => [id, new Blob()]));
	let puts = 0;

	const store = {
		files,
		deleted: [] as string[],
		get puts() {
			return puts;
		},
		async put(blob: Blob, extension = 'webp') {
			puts += 1;
			if (options.failPutAt === puts) throw new Error(`put ${puts} failed`);
			const id = `asset-${puts}.${extension}`;
			files.set(id, blob);
			return id;
		},
		async read(assetId: string) {
			const blob = files.get(assetId);
			if (!blob) throw new Error(`${assetId} missing`);
			return blob;
		},
		async readUrl(assetId: string) {
			return `blob:${assetId}`;
		},
		async delete(assetId: string) {
			if (options.failDelete?.includes(assetId)) throw new Error(`delete ${assetId} failed`);
			files.delete(assetId);
			store.deleted.push(assetId);
		},
	};

	return store satisfies AssetStore;
}
