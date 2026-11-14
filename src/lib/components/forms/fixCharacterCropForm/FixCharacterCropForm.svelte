<script lang="ts">
	import { enhance } from '$app/forms';
	import { readAssetDataUrl } from '$lib/client/assets/read-data-url';
	import { workflowDeps } from '$lib/client/workflow-deps';
	import { expectWorkflow } from '$lib/features/comics/client/workflows/asset-workflow';
	import { fixCharacterCrop } from '$lib/features/panels/client/workflows/fix-character-crop';
	import {
		FIX_CHARACTER_CROP_ACTION,
		type FixCharacterCropResult,
	} from '$lib/features/panels/contracts/fixCharacterCrop';
	import { enhanceAction } from '$lib/forms/enhance-action';
	import { encodeFormValue } from '$lib/forms/form-data';
	import { m } from '$lib/paraglide/messages';
	import type { SubmitFunction } from '@sveltejs/kit';
	import type { FixCharacterCropFormProps } from './fixCharacterCropFormTypes';

	let { label, values, imageAssetId }: FixCharacterCropFormProps = $props();

	const handleSubmit = enhanceAction<FixCharacterCropResult>(
		m.loadingFixCharacterCrop(),
		async ({ data, update }) => {
			expectWorkflow(await fixCharacterCrop(workflowDeps, data));
			await update();
		},
	);

	// The image is large, so it's read from OPFS here, not carried in the form values.
	const prepareSubmit: SubmitFunction<FixCharacterCropResult> = async (input) => {
		input.formData.append('image', await readAssetDataUrl(workflowDeps.assets, imageAssetId));
		return handleSubmit(input);
	};
</script>

<!-- multipart: the panel image is a data URL, which urlencoding would inflate -->
<form
	method="POST"
	enctype="multipart/form-data"
	action={`?/${FIX_CHARACTER_CROP_ACTION}`}
	use:enhance={prepareSubmit}
>
	{#each Object.entries(values) as [name, value] (name)}
		{#if value !== undefined}
			<input type="hidden" {name} value={encodeFormValue(value)} />
		{/if}
	{/each}

	<button type="submit">{label}</button>
</form>
