<script lang="ts">
	import { type RemoveFieldItemFormProps } from './removeFieldItemFormTypes';

	let { label, action, values }: RemoveFieldItemFormProps = $props();
</script>

<form method="POST" action={`?/${action}`}>
	{#each values as value (value.name)}
		<input type="hidden" name={value.name} value={value.value} />
	{/each}

	<button type="submit">{label}</button>
</form>
