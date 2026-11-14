<script lang="ts">
	import { enhance } from '$app/forms';
	import { workflowDeps } from '$lib/client/workflow-deps';
	import { expectWorkflow } from '$lib/features/comics/client/workflows/asset-workflow';
	import { restorePanelImage } from '$lib/features/panels/client/workflows/restore-panel-image';
	import {
		getRestorePanelImageValues,
		RESTORE_PANEL_IMAGE_ACTION,
	} from '$lib/features/panels/contracts/restorePanelImage';
	import { enhanceClientCommand } from '$lib/forms/enhance-client-command';
	import { m } from '$lib/paraglide/messages';
	import type { RestorePanelImageFormProps } from './restorePanelImageFormTypes';

	let { comicId, panelId, onSuccess }: RestorePanelImageFormProps = $props();

	const handleSubmit = enhanceClientCommand(
		m.loadingRestoreImage(),
		getRestorePanelImageValues,
		async (values) => expectWorkflow(await restorePanelImage(workflowDeps, values)),
		async ({ update }) => {
			await update();
			onSuccess?.();
		},
	);
</script>

<form method="POST" action={`?/${RESTORE_PANEL_IMAGE_ACTION}`} use:enhance={handleSubmit}>
	<input type="hidden" name="comicId" value={comicId} />
	<input type="hidden" name="panelId" value={panelId} />
	<button type="submit">{m.restorePreviousImage()}</button>
</form>
