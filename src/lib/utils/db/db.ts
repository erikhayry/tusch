import { type Comic } from '$lib/types';
import { ComicsMock } from '$lib/types/test/utils/mockTypes';

const DB: Map<string, Comic> = new Map();

seedDB();

export function seedDB(): void {
	clearComics();
	ComicsMock.forEach((comic) => {
		addComic(comic);
	});
}

export function getComic(id: string): Comic | undefined {
	return DB.get(id);
}

export function getComics(): Comic[] {
	return Array.from(DB.values());
}

export function addComic(comic: Comic): Comic[] {
	DB.set(comic.id, comic);

	return getComics();
}

export function removeComic(id: string): Comic[] {
	DB.delete(id);

	return getComics();
}

export function clearComics(): void {
	DB.clear();
}

export function updateComic(comic: Comic): Comic[] {
	DB.set(comic.id, comic);

	return getComics();
}

export function removeImage(comicId: string, panelId: string): Comic[] {
	const comic = getComic(comicId);
	const panel = comic?.panels.find((panel) => panel.id === panelId);

	if (comic && panel) {
		panel.image = undefined;
	}

	return getComics();
}
