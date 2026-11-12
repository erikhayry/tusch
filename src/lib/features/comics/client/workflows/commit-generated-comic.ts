import type { Comic } from '$lib/types';
import type { ComicCommands } from '../comic-commands';
import {
	base64ImageToBlob,
	runAssetWorkflow,
	type AssetWorkflowDeps,
	type WorkflowResult,
} from './asset-workflow';

export interface ComicWorkflowDeps extends AssetWorkflowDeps {
	commands: Pick<ComicCommands, 'addComic'>;
}

/** Stores a generated comic. Its cover `src` arrives as base64 and is staged first. */
export function commitGeneratedComic(
	deps: ComicWorkflowDeps,
	comic: Comic,
): Promise<WorkflowResult> {
	return runAssetWorkflow(deps, async (stage) => {
		if (!comic.cover) return () => deps.commands.addComic(comic);

		const src = await stage(base64ImageToBlob(comic.cover.landscape.src));
		const stored: Comic = {
			...comic,
			cover: {
				...comic.cover,
				landscape: { ...comic.cover.landscape, src },
				portrait: { ...comic.cover.portrait, src },
			},
		};

		return () => deps.commands.addComic(stored);
	});
}
