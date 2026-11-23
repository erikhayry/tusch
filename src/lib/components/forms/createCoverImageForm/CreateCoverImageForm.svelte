<script lang="ts">
	import { enhance, type SubmitFunction } from '$app/forms';
	import { readAssetDataUrl } from '#lib/client/assets/read-data-url.ts';
	import { workflowDeps } from '#lib/client/workflow-deps.ts';
	import { expectWorkflow } from '#lib/features/comics/client/workflows/asset-workflow.ts';
	import { commitGeneratedCover } from '#lib/features/comics/client/workflows/commit-generated-cover.ts';
	import {
		CREATE_COVER_IMAGE_ACTION,
		type CreateCoverImageResult,
	} from '#lib/features/comics/contracts/createCoverImage.ts';
	import { EXISTING_IMAGE_VALUE_KEY } from '#lib/features/panels/contracts/createPanelImage.ts';
	import { withGlobalInstructions } from '#lib/features/settings/client/global-instructions.ts';
	import { enhanceAction } from '#lib/forms/enhance-action.ts';
	import { encodeFormValue } from '#lib/forms/form-data.ts';
	import { variantFailedMessage } from '#lib/forms/variant-failure.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { INSTRUCTIONS_VALUE_KEY } from '#lib/utils/db/dbTypes.ts';
	import type { CreateCoverImageFormProps } from './createCoverImageFormTypes';

	const handleSubmit = withGlobalInstructions(
		enhanceAction<CreateCoverImageResult>(
			m.loadingCreateCoverImage(),
			async ({ data, update, showError }) => {
				expectWorkflow(await commitGeneratedCover(workflowDeps, data));
				// The variant that succeeded is saved; say which one wasn't made (REQ-011).
				if (data.failedVariant) {
					showError(variantFailedMessage(data.failedVariant));
				}
				await update();
			},
		),
	);

	let { label, values, baseImage }: CreateCoverImageFormProps = $props();

	/** The variant the cover has is sent as the reference, so the new one matches it (REQ-280-1). */
	const prepareSubmit: SubmitFunction<CreateCoverImageResult> = async (input) => {
		if (baseImage) {
			input.formData.append(
				EXISTING_IMAGE_VALUE_KEY,
				await readAssetDataUrl(workflowDeps.assets, baseImage),
			);
		}
		return handleSubmit(input);
	};
</script>

<form method="POST" action={`?/${CREATE_COVER_IMAGE_ACTION}`} use:enhance={prepareSubmit}>
	{#each Object.entries(values) as entry (entry[0])}
		<input type="hidden" name={entry[0]} value={encodeFormValue(entry[1])} />
	{/each}

	<label for={INSTRUCTIONS_VALUE_KEY}>
		{m.instructions()}
		<textarea id={INSTRUCTIONS_VALUE_KEY} name={INSTRUCTIONS_VALUE_KEY} rows={5}></textarea>
	</label>

	<button type="submit">{label}</button>
</form>
