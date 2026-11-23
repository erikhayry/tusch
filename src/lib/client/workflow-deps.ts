import { opfsAssetStore } from '#lib/client/assets/opfs-asset-store.ts';
import { comicCommands } from '#lib/features/comics/client/comic-commands.ts';
import { comicStore } from '#lib/features/comics/client/comic-store.svelte.ts';
import { cropBlob } from '#lib/features/panels/client/workflows/crop-adapter.ts';
import { generateId } from '#lib/utils/id.ts';

/** Production dependencies for client workflows. */
export const workflowDeps = {
	assets: opfsAssetStore,
	store: comicStore,
	commands: comicCommands,
	crop: cropBlob,
	createId: generateId,
};
