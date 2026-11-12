import { opfsAssetStore } from '$lib/client/assets/opfs-asset-store';
import { comicCommands } from '$lib/features/comics/client/comic-commands';
import { comicStore } from '$lib/features/comics/client/comic-store.svelte';
import { cropBlob } from '$lib/features/panels/client/workflows/crop-adapter';
import { generateId } from '$lib/utils/id';

/** Production dependencies for client workflows. */
export const workflowDeps = {
	assets: opfsAssetStore,
	store: comicStore,
	commands: comicCommands,
	crop: cropBlob,
	createId: generateId,
};
