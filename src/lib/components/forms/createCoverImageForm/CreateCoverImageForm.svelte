<script lang="ts">
	import { enhance } from '$app/forms';
	import { workflowDeps } from '$lib/client/workflow-deps';
	import { expectWorkflow } from '$lib/features/comics/client/workflows/asset-workflow';
	import { commitGeneratedCover } from '$lib/features/comics/client/workflows/commit-generated-cover';
	import {
		CREATE_COVER_IMAGE_ACTION,
		type CreateCoverImageResult,
	} from '$lib/features/comics/contracts/createCoverImage';
	import { withGlobalInstructions } from '$lib/features/settings/client/global-instructions';
	import { enhanceAction } from '$lib/forms/enhance-action';
	import { encodeFormValue } from '$lib/forms/form-data';
	import { m } from '$lib/paraglide/messages';
	import { INSTRUCTIONS_VALUE_KEY } from '$lib/utils/db/dbTypes';
	import type { CreateCoverImageFormProps } from './createCoverImageFormTypes';

	const handleSubmit = withGlobalInstructions(
		enhanceAction<CreateCoverImageResult>(m.loadingCreateCoverImage(), async ({ data, update }) => {
			expectWorkflow(await commitGeneratedCover(workflowDeps, data));
			await update();
		}),
	);

	let { label, values }: CreateCoverImageFormProps = $props();
</script>

<form method="POST" action={`?/${CREATE_COVER_IMAGE_ACTION}`} use:enhance={handleSubmit}>
	{#each Object.entries(values) as entry (entry[0])}
		<input type="hidden" name={entry[0]} value={encodeFormValue(entry[1])} />
	{/each}

	<label for={INSTRUCTIONS_VALUE_KEY}>
		{m.instructions()}
		<textarea id={INSTRUCTIONS_VALUE_KEY} name={INSTRUCTIONS_VALUE_KEY} rows={5}></textarea>
	</label>

	<button type="submit">{label}</button>
</form>
