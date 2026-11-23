import type { ComicCommands } from '#lib/features/comics/client/comic-commands.ts';
import {
	runAssetWorkflow,
	type AssetWorkflowDeps,
	type WorkflowResult,
} from '#lib/features/comics/client/workflows/asset-workflow.ts';
import type { UndoCharacterCropFixValues } from '../../contracts/undoCharacterCropFix';

export interface UndoCharacterCropFixDeps extends AssetWorkflowDeps {
	commands: Pick<ComicCommands, 'undoCharacterCropFix'>;
}

/**
 * Puts the crops from before the latest fix back. Going through the asset workflow
 * deletes the fixed crops' files once nothing references them.
 */
export function undoCharacterCropFix(
	deps: UndoCharacterCropFixDeps,
	{ comicId, characterId, characterImageId }: UndoCharacterCropFixValues,
): Promise<WorkflowResult> {
	return runAssetWorkflow(deps, () =>
		Promise.resolve(() =>
			deps.commands.undoCharacterCropFix(comicId, characterId, characterImageId),
		),
	);
}
