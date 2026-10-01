import { type Comic, type Panel } from '$lib/types';
import { ComicsMock } from '$lib/types/test/utils/mockTypes';
import type { Field } from './dbTypes';

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

function findPanel(comicId: string, panelId: string): Panel | undefined {
	return getComic(comicId)?.panels.find((panel) => panel.id === panelId);
}

export function removeImage(comicId: string, panelId: string): Comic[] {
	const panel = findPanel(comicId, panelId);

	if (panel) {
		panel.image = undefined;
	}

	return getComics();
}

export function removeFieldItem(
	comicId: string,
	panelId: string,
	field: Field,
	index: number,
): Comic[] {
	const panel = findPanel(comicId, panelId);

	if (panel) {
		panel[field] = panel[field].filter((_, i) => i !== index);
	}

	return getComics();
}

export function updateFieldItem(
	comicId: string,
	panelId: string,
	field: Field,
	index: number,
	value: string,
): Comic[] {
	const panel = findPanel(comicId, panelId);

	if (panel) {
		panel[field][index] = value;
	}

	return getComics();
}
