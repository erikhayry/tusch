import type { CreateCoverImageResult } from '#lib/features/comics/contracts/createCoverImage.ts';
import type { ResponsivePanelImage } from '#lib/types/index.ts';
import { CommandFailureCodes, type ComicCommands } from '../comic-commands';
import { getComic } from '../comic-selectors';
import {
	runAssetWorkflow,
	stageVariants,
	type AssetWorkflowDeps,
	type WorkflowResult,
} from './asset-workflow';

export interface CoverWorkflowDeps extends AssetWorkflowDeps {
	commands: Pick<ComicCommands, 'replaceCover'>;
}

/**
 * Stores the generated variants of a cover. A variant that wasn't generated, because the
 * cover already has it or the format doesn't ask for it, keeps the stored one (REQ-280-1).
 */
export function commitGeneratedCover(
	deps: CoverWorkflowDeps,
	{ comicId, image }: Pick<CreateCoverImageResult, 'comicId' | 'image'>,
): Promise<WorkflowResult> {
	return runAssetWorkflow(deps, async (stage) => {
		const comic = getComic(deps.store.comics, comicId);
		if (!comic) {
			return {
				ok: false,
				code: CommandFailureCodes['comic-not-found'],
				message: `Comic ${comicId} not found`,
			};
		}

		const staged = await stageVariants(stage, image);
		const cover: ResponsivePanelImage = {
			// A variant made next to a stored one keeps that one's alt text.
			alt: comic.cover?.alt ?? image.alt,
			portrait: staged.portrait ?? comic.cover?.portrait,
			landscape: staged.landscape ?? comic.cover?.landscape,
		};

		return () => deps.commands.replaceCover(comicId, cover);
	});
}
