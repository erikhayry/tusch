import type { Character, Comic, ImageAsset, Panel } from '$lib/types';

export function getComics(comics: readonly Comic[]): Comic[] {
	return [...comics];
}

export function getComic(comics: readonly Comic[], comicId: string): Comic | undefined {
	return comics.find((comic) => comic.id === comicId);
}

export function getPanel(
	comics: readonly Comic[],
	comicId: string,
	panelId: string,
): Panel | undefined {
	return getComic(comics, comicId)?.panels.find((panel) => panel.id === panelId);
}

export function getCharacter(
	comics: readonly Comic[],
	comicId: string,
	characterId: string,
): Character | undefined {
	return getComic(comics, comicId)?.characters.find((character) => character.id === characterId);
}

export function getCharacterName(
	comics: readonly Comic[],
	comicId: string,
	characterId: string,
): string | undefined {
	return getCharacter(comics, comicId, characterId)?.name;
}

export function getCharacterImageForPanel(
	comics: readonly Comic[],
	comicId: string,
	panelId: string,
	characterId: string,
): ImageAsset | undefined {
	return getCharacter(comics, comicId, characterId)?.images.find(
		(image) => image.panelId === panelId,
	)?.head;
}

/** One stored image per existing panel (the most recent), in panel order. */
export function getCharacterGalleryImages(
	comics: readonly Comic[],
	comicId: string,
	characterId: string,
): { id: string; panel: Panel; number: number; head: ImageAsset; full: ImageAsset }[] {
	const comic = getComic(comics, comicId);
	const character = getCharacter(comics, comicId, characterId);
	if (!comic || !character) return [];
	return comic.panels.flatMap((panel, index) => {
		const image = character.images.findLast(({ panelId }) => panelId === panel.id);
		return image
			? [{ id: image.id, panel, number: index + 1, head: image.head, full: image.full }]
			: [];
	});
}

export function getPanelsWithCharachter(
	comics: readonly Comic[],
	comicId: string,
	characterId: string,
): Panel[] | undefined {
	return getComic(comics, comicId)?.panels.filter(({ image }) =>
		image?.landscape.characters?.some(({ id }) => id === characterId),
	);
}
