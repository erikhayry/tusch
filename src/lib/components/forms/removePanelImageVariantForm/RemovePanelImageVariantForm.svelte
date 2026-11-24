<script lang="ts">
	import { enhance } from '$app/forms';
	import { workflowDeps } from '#lib/client/workflow-deps.ts';
	import { expectWorkflow } from '#lib/features/comics/client/workflows/asset-workflow.ts';
	import {
		getRemovePanelImageVariantValues,
		REMOVE_PANEL_IMAGE_VARIANT_ACTION,
	} from '#lib/features/panels/contracts/removePanelImageVariant.ts';
	import { removePanelImageVariant } from '#lib/features/panels/client/workflows/remove-panel-image-variant.ts';
	import { enhanceClientCommand } from '#lib/forms/enhance-client-command.ts';
	import DangerButton from '#lib/components/dangerButton/DangerButton.svelte';
	import { m } from '#lib/paraglide/messages.js';
	import type { RemovePanelImageVariantFormProps } from './removePanelImageVariantFormTypes';

	let { label, comicId, panelId, variant, onSuccess }: RemovePanelImageVariantFormProps = $props();

	const handleSubmit = enhanceClientCommand(
		m.loadingDelete(),
		getRemovePanelImageVariantValues,
		async (values) => expectWorkflow(await removePanelImageVariant(workflowDeps, values)),
		async ({ update }) => {
			await update();
			onSuccess?.();
		},
	);
</script>

<form method="POST" action={`?/${REMOVE_PANEL_IMAGE_VARIANT_ACTION}`} use:enhance={handleSubmit}>
	<input type="hidden" name="comicId" value={comicId} />
	<input type="hidden" name="panelId" value={panelId} />
	<input type="hidden" name="variant" value={variant} />
	<DangerButton>{label}</DangerButton>
</form>
