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

function addImageIds(
	ids: Set<string>,
	image?: { landscape: { src: string }; portrait: { src: string } },
) {
	if (!image) return;
	ids.add(image.landscape.src);
	ids.add(image.portrait.src);
}

/** Every asset id referenced by the given comics. */
export function collectAssetIds(comics: readonly Comic[]): Set<string> {
	const ids = new Set<string>();

	for (const comic of comics) {
		addImageIds(ids, comic.cover);
		for (const panel of comic.panels) {
			addImageIds(ids, panel.image);
			addImageIds(ids, panel.previousImage?.image);
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
	// Independent files: delete concurrently so many crops don't make the user wait per file.
	const results = await Promise.all(
		[...new Set(assetIds)].map((assetId) =>
			assets.delete(assetId).then(
				() => undefined,
				() => assetId,
			),
		),
	);
	const failed = results.filter((assetId) => assetId !== undefined);

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
