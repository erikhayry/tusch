<script lang="ts">
	import { enhance } from '$app/forms';
	import { readAssetDataUrl } from '$lib/client/assets/read-data-url';
	import { workflowDeps } from '$lib/client/workflow-deps';
	import { expectWorkflow } from '$lib/features/comics/client/workflows/asset-workflow';
	import { commitGeneratedPanelImage } from '$lib/features/panels/client/workflows/commit-generated-panel-image';
	import {
		CREATE_PANEL_IMAGE_ACTION,
		type CreatePanelImageResult,
	} from '$lib/features/panels/contracts/createPanelImage';
	import { enhanceAction } from '$lib/forms/enhance-action';
	import { encodeFormValue } from '$lib/forms/form-data';
	import { m } from '$lib/paraglide/messages';
	import {
		IMAGE_VALUE_KEY,
		INCLUDE_IMAGE_VALUE_KEY,
		INSTRUCTIONS_VALUE_KEY,
	} from '$lib/utils/db/dbTypes';
	import type { CreatePanelImageFormProps } from './createPanelImageFormTypes';

	const handleSubmit = enhanceAction<CreatePanelImageResult>(
		m.loadingCreatePanelImage(),
		async ({ data, update }) => {
			expectWorkflow(await commitGeneratedPanelImage(workflowDeps, data));
			await update();
		},
	);

	let { label, values, imageName }: CreatePanelImageFormProps = $props();

	let imageUrl = $state<string | null>(null);

	$effect(() => {
		if (imageName) {
			readAssetDataUrl(workflowDeps.assets, imageName).then((url) => {
				imageUrl = url;
			});
		}
	});
</script>

<form method="POST" action={`?/${CREATE_PANEL_IMAGE_ACTION}`} use:enhance={handleSubmit}>
	{#each Object.entries(values) as entry (entry[0])}
		<input type="hidden" name={entry[0]} value={encodeFormValue(entry[1])} />
	{/each}

	{#if imageName}
		<img width="50px" height="auto" src={imageUrl} alt="" />
		<label for={INCLUDE_IMAGE_VALUE_KEY}>
			<input type="hidden" name={IMAGE_VALUE_KEY} value={imageUrl} />
			<input type="checkbox" id={INCLUDE_IMAGE_VALUE_KEY} name={INCLUDE_IMAGE_VALUE_KEY} />
			<span>{m.includeImage()}</span>
		</label>
	{/if}

	<label for={INSTRUCTIONS_VALUE_KEY}>
		{m.instructions()}
		<textarea id={INSTRUCTIONS_VALUE_KEY} name={INSTRUCTIONS_VALUE_KEY} rows={5}></textarea>
	</label>

	<button type="submit">{label}</button>
</form>
