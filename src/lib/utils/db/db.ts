import { type Comic } from '$lib/types';

const DB: Map<string, Comic> = new Map();

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
