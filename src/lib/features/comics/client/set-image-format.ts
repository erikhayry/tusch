import type { SetImageFormatValues } from '../contracts/setImageFormat';
import { comicCommands, expectCommitted, type ComicCommands } from './comic-commands';

/** Client command for the image format form. */
export function setImageFormat(
	{ comicId, imageFormat }: SetImageFormatValues,
	commands: Pick<ComicCommands, 'setImageFormat'> = comicCommands,
): void {
	expectCommitted(commands.setImageFormat(comicId, imageFormat));
}
