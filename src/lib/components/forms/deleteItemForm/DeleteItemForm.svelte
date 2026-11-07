<script lang="ts">
	import { enhance } from '$app/forms';
	import { DELETE_ITEM_ACTION, getDeleteValues } from '$lib/features/comics/contracts/deleteItem';
	import { onEdit } from '$lib/utils/actions/onEdit';
	import { deleteType } from '$lib/utils/db/db.svelte';
	import type { DeleteItemFormProps } from './deleteItemFormTypes';

	const handleSubmit = onEdit(getDeleteValues, deleteType);

	let { label, values }: DeleteItemFormProps = $props();
</script>

<form method="POST" action={`?/${DELETE_ITEM_ACTION}`} use:enhance={handleSubmit}>
	{#each Object.entries(values) as entry (entry[0])}
		<input type="hidden" name={entry[0]} value={entry[1]} />
	{/each}

	<button type="submit">{label}</button>
</form>
