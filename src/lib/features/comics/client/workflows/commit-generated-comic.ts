import type { Comic } from '#lib/types/index.ts';
import type { ComicCommands } from '../comic-commands';
import {
	runAssetWorkflow,
	stageVariants,
	type AssetWorkflowDeps,
	type WorkflowResult,
} from './asset-workflow';

export interface ComicWorkflowDeps extends AssetWorkflowDeps {
	commands: Pick<ComicCommands, 'addComic'>;
}

/** Stores a generated comic. Its cover variants' `src` arrive as base64 and are staged first. */
export function commitGeneratedComic(
	deps: ComicWorkflowDeps,
	comic: Comic,
): Promise<WorkflowResult> {
	return runAssetWorkflow(deps, async (stage) => {
		if (!comic.cover) {
			return () => deps.commands.addComic(comic);
		}

		const stored: Comic = {
			...comic,
			cover: { ...comic.cover, ...(await stageVariants(stage, comic.cover)) },
		};

		return () => deps.commands.addComic(stored);
	});
}
