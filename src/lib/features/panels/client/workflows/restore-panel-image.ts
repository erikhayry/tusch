import type { ComicCommands } from '$lib/features/comics/client/comic-commands';
import {
	runAssetWorkflow,
	type AssetWorkflowDeps,
	type WorkflowResult,
} from '$lib/features/comics/client/workflows/asset-workflow';
import type { RestorePanelImageValues } from '../../contracts/restorePanelImage';

export interface RestorePanelImageDeps extends AssetWorkflowDeps {
	commands: Pick<ComicCommands, 'restorePanelImage'>;
}

/**
 * Restores the kept previous image. Going through the asset workflow deletes
 * the replaced image and its crops once nothing references them.
 */
export function restorePanelImage(
	deps: RestorePanelImageDeps,
	{ comicId, panelId }: RestorePanelImageValues,
): Promise<WorkflowResult> {
	return runAssetWorkflow(
		deps,
		// Nothing to stage: the restore only moves metadata and frees assets.
		() => Promise.resolve(() => deps.commands.restorePanelImage(comicId, panelId)),
	);
}
