import {
	comicCommands,
	expectCommitted,
	type ComicCommands,
} from '$lib/features/comics/client/comic-commands';
import type { AddCaptionValues } from '../contracts/addCaption';

/** Client command for the add-caption form. */
export function addCaption(
	{ comicId, panelId, caption }: AddCaptionValues,
	commands: Pick<ComicCommands, 'addCaption'> = comicCommands,
): void {
	expectCommitted(commands.addCaption(comicId, panelId, caption));
}
