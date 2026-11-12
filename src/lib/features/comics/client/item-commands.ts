import { DB_ITEM_TYPE, type DeleteValues, type EditValues } from '$lib/utils/db/dbTypes';
import { comicCommands, expectCommitted, type ComicCommands } from './comic-commands';

export function applyItemDelete(
	values: DeleteValues,
	commands: ComicCommands = comicCommands,
): void {
	switch (values.type) {
		case DB_ITEM_TYPE.enum.coverImage:
			expectCommitted(commands.removeCover(values.comicId));
			return;
		case DB_ITEM_TYPE.enum.panelImage:
			expectCommitted(commands.removePanelImage(values.comicId, values.panelId));
			return;
		case DB_ITEM_TYPE.enum.comics:
			expectCommitted(commands.deleteComic(values.comicId));
			return;
		case DB_ITEM_TYPE.enum.panels:
			expectCommitted(commands.deletePanel(values.comicId, values.panelId));
			return;
		case DB_ITEM_TYPE.enum.dialogue:
			expectCommitted(commands.deleteDialogue(values.comicId, values.panelId, values.index));
			return;
		case DB_ITEM_TYPE.enum.captions:
			expectCommitted(commands.deleteCaption(values.comicId, values.panelId, values.index));
			return;
	}
}

export function applyItemEdit(values: EditValues, commands: ComicCommands = comicCommands): void {
	switch (values.type) {
		case DB_ITEM_TYPE.enum.dialogue:
			expectCommitted(
				commands.editDialogue(values.comicId, values.panelId, values.index, values.value),
			);
			return;
		case DB_ITEM_TYPE.enum.captions:
			expectCommitted(
				commands.editCaption(values.comicId, values.panelId, values.index, values.value),
			);
			return;
	}
}
