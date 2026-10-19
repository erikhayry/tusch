import { browser } from '$app/environment';
import { type Comic, type Model, type Panel, type ResponsiveImage } from '$lib/types';
import { SvelteMap } from 'svelte/reactivity';
import { EXAMPLES } from '../../../examples/examples';
import {
	DB_ITEM_TYPE,
	STORAGE,
	type ConfigValues,
	type DeleteValues,
	type EditValues,
} from './dbTypes';

function loadInitialComics(): [string, Comic][] {
	if (!browser) return [];

	try {
		const stored = localStorage.getItem(STORAGE.COMICS);
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

function loadInitialConfig(): ConfigValues {
	if (!browser) return {};

	try {
		const stored = localStorage.getItem(STORAGE.CONFIG);
		if (stored) return JSON.parse(stored);
		return {};
	} catch (err) {
		console.error('Failed to load DB from localStorage:', err);
	}
	return {};
}
export const COMIC_DB = new SvelteMap<string, Comic>(loadInitialComics());
export const CONFIG_DB = $state<ConfigValues>(loadInitialConfig());

if (COMIC_DB.size === 0) {
	addComic(EXAMPLES[0]);
	addComic({ ...EXAMPLES[0], id: '6dcbdd2b-a490-473f-bb50-fe7c894b8534', title: 'NIRVANA 2' });
	addComic({ ...EXAMPLES[0], id: '6dcbdd2b-a490-473f-bb50-fe7c894b8535', title: 'NIRVANA 3' });
}

export function saveDB(): void {
	if (!browser) return;
	try {
		const entries = Array.from(COMIC_DB.entries());
		localStorage.setItem(STORAGE.COMICS, JSON.stringify(entries));
	} catch (err) {
		console.error('Failed to save DB to localStorage:', err);
	}
}

export function getComic(id: string): Comic | undefined {
	return COMIC_DB.get(id);
}

export function getComics(): Comic[] {
	return Array.from(COMIC_DB.values());
}

export function addComic(comic: Comic): Comic[] {
	COMIC_DB.set(comic.id, comic);
	saveDB();
	return getComics();
}

export function deleteComic(id: string): Comic[] {
	COMIC_DB.delete(id);
	saveDB();
	return getComics();
}

export function clearComics(): void {
	COMIC_DB.clear();
	saveDB();
}

export function updateComic(comic: Comic): Comic[] {
	COMIC_DB.set(comic.id, comic);
	saveDB();
	return getComics();
}

export function getPanel(comicId: string, panelId: string): Panel | undefined {
	return getComic(comicId)?.panels.find((panel) => panel.id === panelId);
}

export function deletePanelImage(comicId: string, panelId: string): Comic[] {
	const comic = COMIC_DB.get(comicId);
	if (comic) {
		const panel = comic.panels.find((p) => p.id === panelId);
		if (panel) {
			panel.image = undefined;
			COMIC_DB.set(comicId, comic);
			saveDB();
		}
	}

	return getComics();
}

export function deleteType(values: DeleteValues): Comic[] {
	switch (values.type) {
		case DB_ITEM_TYPE.enum.coverImage: {
			deleteCoverImage(values.comicId);
			return getComics();
		}

		case DB_ITEM_TYPE.enum.panelImage: {
			deletePanelImage(values.comicId, values.panelId);
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

export function deleteCoverImage(comicId: string): Comic[] {
	const comic = COMIC_DB.get(comicId);
	if (comic) {
		comic.cover = undefined;
		COMIC_DB.set(comicId, comic);
		saveDB();
	}

	return getComics();
}

export function addCoverImage(comicId: string, image: ResponsiveImage): Comic[] {
	const comic = COMIC_DB.get(comicId);
	if (comic) {
		comic.cover = image;
		COMIC_DB.set(comicId, comic);
		saveDB();
	}

	return getComics();
}

export function addPanelImage(comicId: string, panelId: string, image: ResponsiveImage): Comic[] {
	const comic = COMIC_DB.get(comicId);
	if (comic) {
		const panel = comic.panels.find((p) => p.id === panelId);
		if (panel) {
			panel.image = image;
			COMIC_DB.set(comicId, comic);
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

export function getCharacter(comicId: string, characterId: string): string | undefined {
	return getComic(comicId)?.characters.find((charachter) => charachter.id === characterId)?.name;
}

export function saveConfig(): void {
	if (!browser) return;
	try {
		localStorage.setItem(STORAGE.CONFIG, JSON.stringify(CONFIG_DB));
	} catch (err) {
		console.error('Failed to save DB to localStorage:', err);
	}
}

export function getConfig(): ConfigValues {
	return CONFIG_DB;
}

export function addModel(model: Model): ConfigValues {
	const config = getConfig();

	config.model = model;
	saveConfig();

	return getConfig();
}

export function getModel(): Model | undefined {
	return getConfig().model;
}
