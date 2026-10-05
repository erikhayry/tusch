<script lang="ts">
	import { ACTION } from '$lib/utils/actions';
	import { type CreateImageFormProps } from './createImageFormTypes';

	let { label, values }: CreateImageFormProps = $props();
</script>

<form method="POST" action={`?/${ACTION.CREATE_IMAGE}`}>
	{#each Object.entries(values) as entry (entry[0])}
		<input type="hidden" name={entry[0]} value={entry[1]} />
	{/each}

	<button type="submit">{label}</button>
</form>
