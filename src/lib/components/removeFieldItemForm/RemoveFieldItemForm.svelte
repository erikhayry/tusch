<script lang="ts">
	import { ACTION } from '$lib/utils/actions';
	import { type RemoveFieldItemFormProps } from './removeFieldItemFormTypes';

	let { label, values }: RemoveFieldItemFormProps = $props();
</script>

<form method="POST" action={`?/${ACTION.DELETE}`}>
	{#each Object.entries(values) as entry (entry[0])}
		<input type="hidden" name={entry[0]} value={entry[1]} />
	{/each}

	<button type="submit">{label}</button>
</form>
