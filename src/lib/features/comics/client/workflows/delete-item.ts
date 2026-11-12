import { deleteUnreferencedAssets, type CleanupResult } from '$lib/client/assets/asset-store';
import type { DeleteValues } from '$lib/utils/db/dbTypes';
import type { ComicCommands } from '../comic-commands';
import { applyItemDelete } from '../item-commands';
import type { AssetWorkflowDeps } from './asset-workflow';

export interface DeleteItemDeps extends AssetWorkflowDeps {
	commands: ComicCommands;
}

/** Deletes a domain item, then removes the assets it owned that nothing else references. */
export async function deleteItemWithAssets(
	deps: DeleteItemDeps,
	values: DeleteValues,
): Promise<CleanupResult> {
	const before = deps.store.comics;
	applyItemDelete(values, deps.commands);

	return deleteUnreferencedAssets(deps.assets, before, deps.store.comics);
}
