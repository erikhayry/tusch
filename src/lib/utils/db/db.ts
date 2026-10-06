import { type Comic, type Panel, type ResponsiveImage } from '$lib/types';
import { getComicsMock } from '$lib/types/test/utils/mockTypes';
import { DB_ITEM_TYPE, type DeleteValues, type EditValues } from './dbTypes';

const DB: Map<string, Comic> = new Map();

seedDB();

export function seedDB(): void {
	clearComics();
	getComicsMock().forEach((comic) => {
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

export function deleteComic(id: string): Comic[] {
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

export function getPanel(comicId: string, panelId: string): Panel | undefined {
	return getComic(comicId)?.panels.find((panel) => panel.id === panelId);
}

export function deleteImage(comicId: string, panelId: string): Comic[] {
	const panel = getPanel(comicId, panelId);

	if (panel) {
		panel.image = undefined;
	}

	return getComics();
}

export function deleteType(values: DeleteValues): Comic[] {
	switch (values.type) {
		case DB_ITEM_TYPE.enum.image: {
			deleteImage(values.comicId, values.panelId);
			break;
		}

		case DB_ITEM_TYPE.enum.comics: {
			deleteComic(values.comicId);
			break;
		}

		case DB_ITEM_TYPE.enum.panels: {
			const comic = getComic(values.comicId);
			if (comic) {
				comic.panels = comic.panels.filter((panel) => panel.id !== values.panelId);
			}
			break;
		}

		case DB_ITEM_TYPE.enum.dialogue:
		case DB_ITEM_TYPE.enum.captions: {
			const panel = getPanel(values.comicId, values.panelId);
			if (panel) {
				panel[values.type] = panel[values.type].filter((_, index) => index !== values.index);
			}
		}
	}

	return getComics();
}

export function editType(values: EditValues): Comic[] {
	switch (values.type) {
		case DB_ITEM_TYPE.enum.dialogue:
		case DB_ITEM_TYPE.enum.captions: {
			const panel = getPanel(values.comicId, values.panelId);
			if (panel) {
				panel[values.type][values.index] = values.value;
			}
			break;
		}
	}

	return getComics();
}

export function addImage(comicId: string, panelId: string, image: ResponsiveImage): Comic[] {
	const comic = getComic(comicId);
	if (comic) {
		const panel = getPanel(comicId, panelId);
		if (panel) {
			panel.image = image;
		}
	}

	return getComics();
}

export function addPanel(comicId: string, panel: Panel, index: number): Comic[] {
	const comic = getComic(comicId);
	if (comic) {
		comic.panels.splice(index, 0, panel);
	}

	return getComics();
}
