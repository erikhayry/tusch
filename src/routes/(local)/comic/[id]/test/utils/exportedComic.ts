import { m } from '#lib/paraglide/messages.js';
import { expect, type Page } from '@playwright/test';
import { activate } from '../../../../../../tests/e2e/keyboard';

/** The "Export comic data" link of the comic page (REQ-90-1). */
export const exportLink = (page: Page) =>
	page.getByRole('link', { name: m.exportComicData(), exact: true });

/** Activate "Export comic data" with the keyboard; returns the saved file's name and parsed JSON. */
export async function exportComicData(page: Page): Promise<{ fileName: string; json: unknown }> {
	const link = exportLink(page);
	await expect(link).toBeVisible();
	const [download] = await Promise.all([page.waitForEvent('download'), activate(page, link)]);
	const chunks: Buffer[] = [];
	for await (const chunk of await download.createReadStream()) {
		chunks.push(Buffer.from(chunk));
	}
	return {
		fileName: download.suggestedFilename(),
		json: JSON.parse(Buffer.concat(chunks).toString()),
	};
}

/** Every `src` of a comic's images: cover, panels (and their undo copy) and character crops. */
export function imageSources(comic: {
	cover?: { portrait?: { src: string }; landscape?: { src: string } };
	panels: { image?: { portrait?: { src: string }; landscape?: { src: string } } }[];
	characters: {
		images: {
			head: { src: string };
			full: { src: string };
			previous?: { head: { src: string }; full: { src: string } };
		}[];
	}[];
}): string[] {
	const variants = (image?: { portrait?: { src: string }; landscape?: { src: string } }) => [
		image?.portrait?.src,
		image?.landscape?.src,
	];
	return [
		...variants(comic.cover),
		...comic.panels.flatMap((panel) => variants(panel.image)),
		...comic.characters.flatMap((character) =>
			character.images.flatMap((image) => [
				image.head.src,
				image.full.src,
				image.previous?.head.src,
				image.previous?.full.src,
			]),
		),
	].filter((src): src is string => Boolean(src));
}
