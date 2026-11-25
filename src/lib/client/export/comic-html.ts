import { SpeechLineSchema } from '#lib/components/panelBoxes/panelBoxesTypes.ts';
import { m } from '#lib/paraglide/messages.js';
import { z } from 'zod';
import appCss from '../../../app.css?raw';
import documentCss from './comic-document.css?raw';

// One embedded file: a `data:` URL plus the stored size, which reserves the box (as the viewer does).
const EmbeddedVariantSchema = z.object({
	src: z.string(),
	width: z.number(),
	height: z.number(),
});

/** A cover or panel image with every readable variant embedded; at least one is set. */
export const EmbeddedImageSchema = z.object({
	alt: z.string(),
	portrait: z.optional(EmbeddedVariantSchema),
	landscape: z.optional(EmbeddedVariantSchema),
});
export type EmbeddedImage = z.infer<typeof EmbeddedImageSchema>;

export const ExportedPanelSchema = z.object({
	captions: z.array(z.string()),
	dialogue: z.array(SpeechLineSchema),
	image: z.optional(EmbeddedImageSchema),
});

export const ExportedComicSchema = z.object({
	title: z.string(),
	lang: z.string(),
	cover: z.optional(EmbeddedImageSchema),
	panels: z.array(ExportedPanelSchema),
});
export type ExportedComic = z.infer<typeof ExportedComicSchema>;

/** Characters that aren't allowed in file names on common systems, and control characters. */
const UNSAFE_FILE_NAME_CHARACTERS = /[\\/:*?"<>|]|\p{Cc}/gu;

/** A download's file name: the title (or "Untitled comic") with unsafe characters replaced. */
export function comicFileName(title: string, extension: string = 'html'): string {
	const name = title.trim().replace(UNSAFE_FILE_NAME_CHARACTERS, '-') || m.untitledComic();
	return `${name}.${extension}`;
}

const HTML_ESCAPES: Record<string, string> = {
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
	'"': '&quot;',
	"'": '&#39;',
};

export function escapeHtml(value: string): string {
	return value.replace(/[&<>"']/g, (character) => HTML_ESCAPES[character] ?? character);
}

function renderImage(image: EmbeddedImage): string {
	const { alt, portrait, landscape } = image;
	if (portrait && landscape) {
		// The browser picks the file by orientation (REQ-103-5); `screen` keeps print on the
		// portrait file (REQ-89-4). The <img> is sized from the portrait file, as in the viewer,
		// so the box is reserved.
		return `<picture><source media="screen and (orientation: landscape)" srcset="${escapeHtml(landscape.src)}"><img src="${escapeHtml(portrait.src)}" width="${portrait.width}" height="${portrait.height}" alt="${escapeHtml(alt)}"></picture>`;
	}
	const only = portrait ?? landscape;
	if (!only) {
		return '';
	}
	return `<img src="${escapeHtml(only.src)}" width="${only.width}" height="${only.height}" alt="${escapeHtml(alt)}">`;
}

/** Captions top-left and speech bottom over the picture, or stacked below it (as PanelBoxes). */
function renderBoxes(panel: z.infer<typeof ExportedPanelSchema>, overlay: boolean): string {
	const captions =
		panel.captions.length > 0
			? `<ul class="captions">${panel.captions.map((caption) => `<li class="box">${escapeHtml(caption)}</li>`).join('')}</ul>`
			: '';
	const speech =
		panel.dialogue.length > 0
			? `<ul class="speech">${panel.dialogue
					.map(
						({ speaker, text }) =>
							`<li class="box">${speaker ? `<strong>${escapeHtml(speaker)}</strong>` : ''}${escapeHtml(text)}</li>`,
					)
					.join('')}</ul>`
			: '';
	return `<div class="boxes${overlay ? ' overlay' : ''}">${captions}${speech}</div>`;
}

function renderPanel(panel: z.infer<typeof ExportedPanelSchema>, number: number): string {
	const heading = `<h2 class="visually-hidden">${escapeHtml(m.panel({ number }))}</h2>`;
	if (!panel.image) {
		return `<section>${heading}${renderBoxes(panel, false)}</section>`;
	}
	return `<section>${heading}<div class="picture">${renderImage(panel.image)}${renderBoxes(panel, true)}</div></section>`;
}

/**
 * One self-contained HTML document that looks like the viewer: no script, form, button or
 * link, every image a `data:` URL and the CSS inlined (REQ-88-2). Pure: it reads no storage.
 */
export function renderComicHtml(comic: ExportedComic): string {
	const title = escapeHtml(comic.title);
	const cover = comic.cover ? renderImage(comic.cover) : '';
	const coverTitleClass = comic.cover ? ' class="overlay"' : '';
	const panels = comic.panels.map((panel, index) => renderPanel(panel, index + 1)).join('');

	return `<!doctype html>
<html lang="${escapeHtml(comic.lang)}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<style>${appCss}
${documentCss}</style>
</head>
<body class="reader">
<main>
<div class="cover">${cover}<h1${coverTitleClass}>${title}</h1></div>
${panels}
</main>
</body>
</html>
`;
}
