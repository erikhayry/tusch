<script lang="ts">
	import { enhance } from '$app/forms';
	import { applyItemDelete } from '$lib/features/comics/client/item-commands';
	import { DELETE_ITEM_ACTION, getDeleteValues } from '$lib/features/comics/contracts/deleteItem';
	import { enhanceClientCommand } from '$lib/forms/enhance-client-command';
	import type { DeleteItemFormProps } from './deleteItemFormTypes';

	const handleSubmit = enhanceClientCommand(getDeleteValues, applyItemDelete, ({ update }) =>
		update(),
	);

	let { label, values }: DeleteItemFormProps = $props();
</script>

<form method="POST" action={`?/${DELETE_ITEM_ACTION}`} use:enhance={handleSubmit}>
	{#each Object.entries(values) as entry (entry[0])}
		<input type="hidden" name={entry[0]} value={entry[1]} />
	{/each}

	<button type="submit">{label}</button>
</form>
