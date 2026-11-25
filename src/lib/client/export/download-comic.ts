import { opfsAssetStore } from '#lib/client/assets/opfs-asset-store.ts';
import { readAssetDataUrl } from '#lib/client/assets/read-data-url.ts';
import type { AssetStore } from '#lib/client/assets/asset-store.ts';
import { m } from '#lib/paraglide/messages.js';
import { getLocale } from '#lib/paraglide/runtime.js';
import type { Comic, ImageAsset, ResponsivePanelImage } from '#lib/types/index.ts';
import {
	comicFileName,
	renderComicHtml,
	type EmbeddedImage,
	type ExportedComic,
} from './comic-html.ts';

import { saveFile } from './save-file.ts';

type AssetReader = Pick<AssetStore, 'read'>;

/**
 * One variant as a `data:` URL. A file the browser no longer has (REQ-036) yields
 * nothing, so the comic is still exported without that image (REQ-88-4).
 */
async function embedVariant(assets: AssetReader, variant?: ImageAsset) {
	if (!variant) {
		return undefined;
	}
	try {
		const src = await readAssetDataUrl(assets, variant.src);
		return { src, width: variant.width, height: variant.height };
	} catch {
		return undefined;
	}
}

async function embedImage(
	assets: AssetReader,
	image: ResponsivePanelImage | undefined,
): Promise<EmbeddedImage | undefined> {
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
	return { alt: image.alt, portrait, landscape };
}

/** The comic's HTML file and its name, with every readable image embedded. */
export async function buildComicHtml(
	comic: Comic,
	assets: AssetReader = opfsAssetStore,
): Promise<{ fileName: string; html: string }> {
	const panels = await Promise.all(
		comic.panels.map(async (panel) => ({
			captions: panel.captions,
			dialogue: panel.dialogue.map((line) => ({
				speaker: comic.characters.find(({ id }) => id === line.characterId)?.name,
				text: line.text,
			})),
			image: await embedImage(assets, panel.image),
		})),
	);
	const exported: ExportedComic = {
		title: comic.title.trim() || m.untitledComic(),
		lang: getLocale(),
		cover: await embedImage(assets, comic.cover),
		panels,
	};

	return { fileName: comicFileName(comic.title), html: renderComicHtml(exported) };
}

/** Saves the comic as one `.html` file (REQ-88-1). */
export async function downloadComicHtml(comic: Comic): Promise<void> {
	const { fileName, html } = await buildComicHtml(comic);
	saveFile(fileName, new Blob([html], { type: 'text/html' }));
}
