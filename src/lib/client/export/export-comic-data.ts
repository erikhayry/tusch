import type { AssetStore } from '#lib/client/assets/asset-store.ts';
import { opfsAssetStore } from '#lib/client/assets/opfs-asset-store.ts';
import { readAssetDataUrl } from '#lib/client/assets/read-data-url.ts';
import {
	COMIC_EXPORT_FORMAT,
	COMIC_EXPORT_VERSION,
	type ComicExport,
} from '#lib/features/comics/contracts/comicExport.ts';
import type {
	CharacterImage,
	Comic,
	ImageAsset,
	Panel,
	ResponsivePanelImage,
} from '#lib/types/index.ts';
import { comicFileName } from './comic-html.ts';
import { saveFile } from './save-file.ts';

type AssetReader = Pick<AssetStore, 'read'>;
type CropPair = Pick<CharacterImage, 'head' | 'full'>;
type PreviousPanelImage = NonNullable<Panel['previousImage']>;

/**
 * The asset as a `data:` URL, or `undefined` when its file is no longer stored (REQ-036).
 * Leaving the image out keeps the export working for the rest of the comic (REQ-90-3).
 */
async function embedSrc(assets: AssetReader, assetId: string): Promise<string | undefined> {
	try {
		return await readAssetDataUrl(assets, assetId);
	} catch {
		return undefined;
	}
}

/** One variant with its `src` embedded; keeps every other field, such as panel character positions. */
async function embedVariant<T extends ImageAsset>(
	assets: AssetReader,
	variant: T | undefined,
): Promise<T | undefined> {
	if (!variant) {
		return undefined;
	}
	const src = await embedSrc(assets, variant.src);
	return src === undefined ? undefined : { ...variant, src };
}

/** A responsive image with each variant embedded. Without any variant left, the image is left out. */
async function embedImage(
	assets: AssetReader,
	image: ResponsivePanelImage | undefined,
): Promise<ResponsivePanelImage | undefined> {
	if (!image) {
		return undefined;
	}
	const [portrait, landscape] = await Promise.all([
		embedVariant(assets, image.portrait),
		embedVariant(assets, image.landscape),
	]);
	if (!portrait && !landscape) {
		return undefined;
	}
	return { ...image, portrait, landscape };
}

/** A panel's previous image (its one undo step). It is dropped when its file is gone. */
async function embedPreviousImage(
	assets: AssetReader,
	previous: PreviousPanelImage | undefined,
): Promise<PreviousPanelImage | undefined> {
	if (!previous) {
		return undefined;
	}
	const image = await embedImage(assets, previous.image);
	return image ? { ...previous, image } : undefined;
}

/** A head and full crop together: a crop without one of them can't be shown, so both go. */
async function embedCropPair(assets: AssetReader, crops: CropPair): Promise<CropPair | undefined> {
	const [head, full] = await Promise.all([
		embedSrc(assets, crops.head.src),
		embedSrc(assets, crops.full.src),
	]);
	if (head === undefined || full === undefined) {
		return undefined;
	}
	return { head: { ...crops.head, src: head }, full: { ...crops.full, src: full } };
}

/** A character image whose current crops are gone is dropped; a missing `previous` drops only itself. */
async function embedCharacterImage(
	assets: AssetReader,
	image: CharacterImage,
): Promise<CharacterImage | undefined> {
	const current = await embedCropPair(assets, image);
	if (!current) {
		return undefined;
	}
	const previous = image.previous ? await embedCropPair(assets, image.previous) : undefined;
	return { ...image, ...current, previous };
}

/** The versioned export of a comic with every readable image embedded as a `data:` URL (REQ-90-2). */
export async function buildComicData(
	comic: Comic,
	assets: AssetReader = opfsAssetStore,
): Promise<ComicExport> {
	const cover = await embedImage(assets, comic.cover);
	const panels = await Promise.all(
		comic.panels.map(async (panel) => ({
			...panel,
			image: await embedImage(assets, panel.image),
			previousImage: await embedPreviousImage(assets, panel.previousImage),
		})),
	);
	const characters = await Promise.all(
		comic.characters.map(async (character) => {
			const images = await Promise.all(
				character.images.map((image) => embedCharacterImage(assets, image)),
			);
			return { ...character, images: images.filter((image) => image !== undefined) };
		}),
	);

	return {
		format: COMIC_EXPORT_FORMAT,
		version: COMIC_EXPORT_VERSION,
		comic: { ...comic, cover, panels, characters },
	};
}

/** Saves the comic's data as one `.json` file, named like the `.html` download (REQ-90-1). */
export async function exportComicData(comic: Comic): Promise<void> {
	const data = await buildComicData(comic);
	saveFile(
		comicFileName(comic.title, 'json'),
		new Blob([JSON.stringify(data)], { type: 'application/json' }),
	);
}
