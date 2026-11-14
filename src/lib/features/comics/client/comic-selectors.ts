import {
	ImageAssetSchema,
	type Character,
	type Comic,
	type ImageAsset,
	type Panel,
} from '$lib/types';
import { z } from 'zod';

export const CharacterReferenceGroupSchema = z.object({
	characterId: z.string(),
	characterName: z.string(),
	options: z.array(
		z.object({
			/** Id of the stored `CharacterImage`; submitted as the radio value. */
			imageId: z.string(),
			/** 1-based position of the panel the crop was taken from. */
			panelNumber: z.number().int(),
			head: ImageAssetSchema,
			full: ImageAssetSchema,
		}),
	),
});
export type CharacterReferenceGroup = z.infer<typeof CharacterReferenceGroupSchema>;

/**
 * Characters that speak in the panel and have a stored crop from a different
 * panel, with those crops as options. Crops of the panel itself are left out:
 * they would be replaced by the image being generated.
 */
export function getCharacterReferenceGroups(
	comics: readonly Comic[],
	comicId: string,
	panelId: string,
): CharacterReferenceGroup[] {
	const comic = getComic(comics, comicId);
	const panel = comic?.panels.find(({ id }) => id === panelId);
	if (!comic || !panel) return [];

	const speakerIds = new Set(panel.dialogue.map(({ characterId }) => characterId));
	return comic.characters
		.filter(({ id }) => speakerIds.has(id))
		.map((character) => ({
			characterId: character.id,
			characterName: character.name,
			options: character.images.flatMap((image) => {
				const index = comic.panels.findIndex(({ id }) => id === image.panelId);
				return image.panelId === panelId || index === -1
					? []
					: [
							{
								imageId: image.id,
								panelNumber: index + 1,
								head: image.head,
								full: image.full,
							},
						];
			}),
		}))
		.filter(({ options }) => options.length > 0)
		.map((group) => ({
			...group,
			options: group.options.toSorted((a, b) => a.panelNumber - b.panelNumber),
		}));
}

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
