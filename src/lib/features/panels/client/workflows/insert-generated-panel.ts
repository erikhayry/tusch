import type { CommandResult, ComicCommands } from '$lib/features/comics/client/comic-commands';
import type { CreatePanelResult } from '$lib/features/panels/contracts/createPanel';

export function insertGeneratedPanel(
	commands: Pick<ComicCommands, 'insertPanel'>,
	{ comicId, panel, index }: Pick<CreatePanelResult, 'comicId' | 'panel' | 'index'>,
): CommandResult {
	return commands.insertPanel(comicId, panel, index);
}
