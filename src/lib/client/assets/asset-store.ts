import type { Comic } from '$lib/types';

export interface AssetStore {
	/** Persists a blob and resolves with the id used to reference it from metadata. */
	put(blob: Blob, extension?: string): Promise<string>;
	/** Reads the stored blob. Rejects when the asset does not exist. */
	read(assetId: string): Promise<Blob>;
	/** Resolves with an object URL that can be passed to `<img>` or a canvas. */
	readUrl(assetId: string): Promise<string>;
	delete(assetId: string): Promise<void>;
}

export type CleanupResult = { ok: true } | { ok: false; failed: string[] };

/** Every asset id referenced by the given comics. */
export function collectAssetIds(comics: readonly Comic[]): Set<string> {
	const ids = new Set<string>();

	for (const comic of comics) {
		if (comic.cover) {
			ids.add(comic.cover.landscape.src);
			ids.add(comic.cover.portrait.src);
		}
		for (const panel of comic.panels) {
			if (panel.image) {
				ids.add(panel.image.landscape.src);
				ids.add(panel.image.portrait.src);
			}
		}
		for (const character of comic.characters) {
			for (const image of character.images) {
				ids.add(image.head.src);
				ids.add(image.full.src);
			}
		}
	}

	return ids;
}

/** Best-effort deletion. Never throws; reports ids that could not be removed. */
export async function deleteAssets(
	assets: AssetStore,
	assetIds: Iterable<string>,
): Promise<CleanupResult> {
	const failed: string[] = [];

	for (const assetId of new Set(assetIds)) {
		try {
			await assets.delete(assetId);
		} catch {
			failed.push(assetId);
		}
	}

	return failed.length === 0 ? { ok: true } : { ok: false, failed };
}

/**
 * Deletes assets that were referenced before a commit but are referenced by
 * no comic after it. Shared assets (e.g. seeded example copies) are kept.
 */
export function deleteUnreferencedAssets(
	assets: AssetStore,
	before: readonly Comic[],
	after: readonly Comic[],
): Promise<CleanupResult> {
	const stillReferenced = collectAssetIds(after);
	const obsolete = [...collectAssetIds(before)].filter((id) => !stillReferenced.has(id));

	return deleteAssets(assets, obsolete);
}

/**
 * Tracks assets written during a workflow so they can be rolled back if the
 * workflow fails before its metadata commit.
 */
export function stageAssets(assets: AssetStore) {
	const staged: string[] = [];

	return {
		staged: staged as readonly string[],
		async put(blob: Blob, extension?: string): Promise<string> {
			const assetId = await assets.put(blob, extension);
			staged.push(assetId);
			return assetId;
		},
		rollback(): Promise<CleanupResult> {
			return deleteAssets(assets, staged);
		},
	};
}
