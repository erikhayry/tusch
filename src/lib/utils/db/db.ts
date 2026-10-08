import { browser } from '$app/environment';
import { type Comic, type Panel, type ResponsiveImage } from '$lib/types';
//import { getComicsMock } from '$lib/types/test/utils/mockTypes';
import { SvelteMap } from 'svelte/reactivity';
import { DB_ITEM_TYPE, type DeleteValues, type EditValues } from './dbTypes';

const STORAGE_KEY = 'comics_db';

function loadInitialData(): [string, Comic][] {
	if (!browser) return [];
	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored) {
			const parsed = JSON.parse(stored);
			if (Array.isArray(parsed) && parsed.length > 0) {
				return parsed;
			}
		}
	} catch (err) {
		console.error('Failed to load DB from localStorage:', err);
	}
	return [];
}

export const DB = new SvelteMap<string, Comic>(loadInitialData());

export function saveDB(): void {
	if (!browser) return;
	try {
		const entries = Array.from(DB.entries());
		localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
	} catch (err) {
		console.error('Failed to save DB to localStorage:', err);
	}
}
/*

export function seedDB(): void {
	clearComics();
	getComicsMock().forEach((comic) => {
		DB.set(comic.id, comic);
	});
	saveDB();
}
*/
export function getComic(id: string): Comic | undefined {
	return DB.get(id);
}

export function getComics(): Comic[] {
	return Array.from(DB.values());
}

export function addComic(comic: Comic): Comic[] {
	DB.set(comic.id, comic);
	saveDB();
	return getComics();
}

export function deleteComic(id: string): Comic[] {
	DB.delete(id);
	saveDB();
	return getComics();
}

export function clearComics(): void {
	DB.clear();
	saveDB();
}

export function updateComic(comic: Comic): Comic[] {
	DB.set(comic.id, comic);
	saveDB();
	return getComics();
}

export function getPanel(comicId: string, panelId: string): Panel | undefined {
	return getComic(comicId)?.panels.find((panel) => panel.id === panelId);
}

export function deleteImage(comicId: string, panelId: string): Comic[] {
	const comic = DB.get(comicId);
	if (comic) {
		const panel = comic.panels.find((p) => p.id === panelId);
		if (panel) {
			panel.image = undefined;
			DB.set(comicId, comic);
			saveDB();
		}
	}

	return getComics();
}

export function deleteType(values: DeleteValues): Comic[] {
	switch (values.type) {
		case DB_ITEM_TYPE.enum.image: {
			deleteImage(values.comicId, values.panelId);
			return getComics();
		}

		case DB_ITEM_TYPE.enum.comics: {
			deleteComic(values.comicId);
			return getComics();
		}

		case DB_ITEM_TYPE.enum.panels: {
			const comic = getComic(values.comicId);
			if (comic) {
				comic.panels = comic.panels.filter((panel) => panel.id !== values.panelId);
			}
			break;
		}

		case DB_ITEM_TYPE.enum.dialogue: {
			const panel = getPanel(values.comicId, values.panelId);
			if (panel) {
				panel[values.type] = panel[values.type].filter((_, index) => index !== values.index);
			}
			break;
		}

		case DB_ITEM_TYPE.enum.captions: {
			const panel = getPanel(values.comicId, values.panelId);
			if (panel) {
				panel[values.type] = panel[values.type].filter((_, index) => index !== values.index);
			}
			break;
		}
	}

	saveDB();
	return getComics();
}

export function editType(values: EditValues): Comic[] {
	switch (values.type) {
		case DB_ITEM_TYPE.enum.dialogue: {
			const panel = getPanel(values.comicId, values.panelId);
			if (panel) {
				panel[values.type][values.index].text = values.value;
			}
			break;
		}
		case DB_ITEM_TYPE.enum.captions: {
			const panel = getPanel(values.comicId, values.panelId);
			if (panel) {
				panel[values.type][values.index] = values.value;
			}
			break;
		}
	}

	saveDB();
	return getComics();
}

export function addImage(comicId: string, panelId: string, image: ResponsiveImage): Comic[] {
	const comic = DB.get(comicId);
	if (comic) {
		const panel = comic.panels.find((p) => p.id === panelId);
		if (panel) {
			panel.image = image;
			DB.set(comicId, comic);
			saveDB();
		}
	}

	return getComics();
}

export function addPanel(comicId: string, panel: Panel, index: number): Comic[] {
	const comic = getComic(comicId);
	if (comic) {
		comic.panels.splice(index, 0, panel);
		saveDB();
	}

	return getComics();
}
