<script lang="ts">
	import { type FieldErrorProps } from './fieldErrorTypes';

	let { id, message }: FieldErrorProps = $props();
</script>

{#if message}
	<p {id} class="field-error">{message}</p>
{/if}

<style>
	.field-error {
		margin-block: 0;
		font-size: var(--font-size-small);
		color: var(--color-danger);
	}
</style>
