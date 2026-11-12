import type { CreateCoverImageResult } from '$lib/features/comics/contracts/createCoverImage';
import type { ComicCommands } from '../comic-commands';
import { getComic } from '../comic-selectors';
import {
	base64ImageToBlob,
	runAssetWorkflow,
	type AssetWorkflowDeps,
	type WorkflowResult,
} from './asset-workflow';

export interface CoverWorkflowDeps extends AssetWorkflowDeps {
	commands: Pick<ComicCommands, 'replaceCover'>;
}

export function commitGeneratedCover(
	deps: CoverWorkflowDeps,
	{ comicId, image }: Pick<CreateCoverImageResult, 'comicId' | 'image'>,
): Promise<WorkflowResult> {
	return runAssetWorkflow(deps, async (stage) => {
		if (!getComic(deps.store.comics, comicId)) {
			return { ok: false, code: 'comic-not-found', message: `Comic ${comicId} not found` };
		}

		const src = await stage(base64ImageToBlob(image.landscape.src));
		const cover = {
			alt: image.alt,
			landscape: { ...image.landscape, src },
			portrait: { ...image.portrait, src },
		};

		return () => deps.commands.replaceCover(comicId, cover);
	});
}
