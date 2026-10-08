<script lang="ts" module>
	export const loaderTestId = 'loader-test-id';
</script>

<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import { globalLoading } from '$lib/utils/states/loading.svelte';
</script>

<div data-testId={loaderTestId} aria-live="polite" role="status">
	{#if globalLoading.isLoading}
		{m.loading()}
	{/if}
</div>
