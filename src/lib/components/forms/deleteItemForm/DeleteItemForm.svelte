<script lang="ts">
	import { enhance } from '$app/forms';
	import { workflowDeps } from '$lib/client/workflow-deps';
	import { deleteItemWithAssets } from '$lib/features/comics/client/workflows/delete-item';
	import { DELETE_ITEM_ACTION, getDeleteValues } from '$lib/features/comics/contracts/deleteItem';
	import { enhanceClientCommand } from '$lib/forms/enhance-client-command';
	import { m } from '$lib/paraglide/messages';
	import type { DeleteItemFormProps } from './deleteItemFormTypes';

	let { label, values, onSuccess }: DeleteItemFormProps = $props();

	const handleSubmit = enhanceClientCommand(
		m.loadingDelete(),
		getDeleteValues,
		async (values) => {
			const cleanup = await deleteItemWithAssets(workflowDeps, values);
			if (!cleanup.ok) console.warn('Could not remove obsolete assets', cleanup.failed);
		},
		async ({ update }) => {
			await update();
			onSuccess?.();
		},
	);
</script>

<form method="POST" action={`?/${DELETE_ITEM_ACTION}`} use:enhance={handleSubmit}>
	{#each Object.entries(values) as entry (entry[0])}
		<input type="hidden" name={entry[0]} value={entry[1]} />
	{/each}

	<button type="submit">{label}</button>
</form>
