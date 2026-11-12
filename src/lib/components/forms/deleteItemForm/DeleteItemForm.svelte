<script lang="ts">
	import { enhance } from '$app/forms';
	import { workflowDeps } from '$lib/client/workflow-deps';
	import { deleteItemWithAssets } from '$lib/features/comics/client/workflows/delete-item';
	import { DELETE_ITEM_ACTION, getDeleteValues } from '$lib/features/comics/contracts/deleteItem';
	import { enhanceClientCommand } from '$lib/forms/enhance-client-command';
	import type { DeleteItemFormProps } from './deleteItemFormTypes';

	const handleSubmit = enhanceClientCommand(
		getDeleteValues,
		async (values) => {
			const cleanup = await deleteItemWithAssets(workflowDeps, values);
			if (!cleanup.ok) console.warn('Could not remove obsolete assets', cleanup.failed);
		},
		({ update }) => update(),
	);

	let { label, values }: DeleteItemFormProps = $props();
</script>

<form method="POST" action={`?/${DELETE_ITEM_ACTION}`} use:enhance={handleSubmit}>
	{#each Object.entries(values) as entry (entry[0])}
		<input type="hidden" name={entry[0]} value={entry[1]} />
	{/each}

	<button type="submit">{label}</button>
</form>
