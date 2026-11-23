import type { CommandResult, ComicCommands } from '#lib/features/comics/client/comic-commands.ts';
import type { CreatePanelResult } from '#lib/features/panels/contracts/createPanel.ts';

export function insertGeneratedPanel(
	commands: Pick<ComicCommands, 'insertPanel'>,
	{ comicId, panel, index }: Pick<CreatePanelResult, 'comicId' | 'panel' | 'index'>,
): CommandResult {
	return commands.insertPanel(comicId, panel, index);
}
