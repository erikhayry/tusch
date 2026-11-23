import type { ImageVariant } from '#lib/types/index.ts';
import type { ComicCommands } from '../comic-commands';
import { runAssetWorkflow, type AssetWorkflowDeps, type WorkflowResult } from './asset-workflow';

export interface RemoveCoverVariantDeps extends AssetWorkflowDeps {
	commands: Pick<ComicCommands, 'removeCoverVariant'>;
}

/**
 * Removes one variant of a cover that has two (REQ-280-1). The commit makes the removed
 * file unreferenced, so the asset cleanup deletes it (REQ-025).
 */
export function removeCoverVariant(
	deps: RemoveCoverVariantDeps,
	{ comicId, variant }: { comicId: string; variant: ImageVariant },
): Promise<WorkflowResult> {
	return runAssetWorkflow(
		deps,
		async () => () => deps.commands.removeCoverVariant(comicId, variant),
	);
}
