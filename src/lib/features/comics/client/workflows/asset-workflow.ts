import {
	deleteUnreferencedAssets,
	stageAssets,
	type AssetStore,
	type CleanupResult,
} from '$lib/client/assets/asset-store';
import { base64ToBlob } from '$lib/utils/storage/utils/base64ToBlob';
import type { CommandFailure, CommandFailureCode, CommandResult } from '../comic-commands';
import type { ComicStoreState } from '../comic-store.svelte';

export interface AssetWorkflowDeps {
	assets: AssetStore;
	store: Pick<ComicStoreState, 'comics'>;
}

export type WorkflowFailure = {
	ok: false;
	code: CommandFailureCode | 'asset-failed';
	message: string;
	/** Present when staged assets had to be rolled back. */
	rollback?: CleanupResult;
};
export type WorkflowSuccess = { ok: true; cleanup: CleanupResult };
export type WorkflowResult = WorkflowSuccess | WorkflowFailure;

type Stage = (blob: Blob, extension?: string) => Promise<string>;
/** Builds the final metadata from staged assets and returns the single commit to run. */
type Prepare = (stage: Stage) => Promise<(() => CommandResult) | CommandFailure>;

export function base64ImageToBlob(base64: string): Blob {
	return base64ToBlob(`data:image/webp;base64,${base64}`);
}

/**
 * Stages every asset, commits metadata once, then removes assets the commit
 * made obsolete. Any failure before the commit rolls back staged assets, so
 * metadata never references an asset that failed to persist.
 */
export async function runAssetWorkflow(
	{ assets, store }: AssetWorkflowDeps,
	prepare: Prepare,
): Promise<WorkflowResult> {
	const staging = stageAssets(assets);
	let commit: Awaited<ReturnType<Prepare>>;

	try {
		commit = await prepare(staging.put);
	} catch (error) {
		return {
			ok: false,
			code: 'asset-failed',
			message: error instanceof Error ? error.message : 'Could not store image',
			rollback: await staging.rollback(),
		};
	}

	if (typeof commit !== 'function') {
		return { ...commit, rollback: await staging.rollback() };
	}

	const before = store.comics;
	const result = commit();
	if (!result.ok) return { ...result, rollback: await staging.rollback() };

	return { ok: true, cleanup: await deleteUnreferencedAssets(assets, before, store.comics) };
}

/** Throws on workflow failure (surfaced by the form enhancer); logs cleanup problems. */
export function expectWorkflow(result: WorkflowResult): void {
	if (!result.ok) {
		if (result.rollback && !result.rollback.ok) {
			console.warn('Could not remove staged assets', result.rollback.failed);
		}
		throw new Error(result.message);
	}

	if (!result.cleanup.ok) {
		console.warn('Could not remove obsolete assets', result.cleanup.failed);
	}
}
