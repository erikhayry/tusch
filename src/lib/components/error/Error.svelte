<script lang="ts" module>
	export const errorTestId = 'error-test-id';
</script>

<script lang="ts">
	import { m } from '$lib/paraglide/messages';

	import { globalError } from '$lib/utils/states/error.svelte';
</script>

<div data-testId={errorTestId} aria-live="polite" role="status">
	{#if globalError.error.isError}
		<p>{m.error()}</p>
		<p>{globalError.error.message}</p>
	{/if}
</div>
