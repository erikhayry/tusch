<script lang="ts" module>
	export const loaderTestId = 'loader-test-id';
</script>

<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import { globalLoading } from '$lib/utils/states/loading.svelte';
</script>

<div data-testId={loaderTestId}>
	<!-- Only the label and "Done" are announced; the ticking seconds stay outside the live region. -->
	<div aria-live="polite" role="status">
		{#if globalLoading.isLoading}
			<span id="loader-label">{globalLoading.label}</span>
		{:else if globalLoading.succeeded}
			<span class="done">{m.done()}</span>
		{/if}
	</div>
	<!-- A silent status region keeps the bar and timer inside a landmark (axe `region`). -->
	<div aria-live="off" role="status">
		{#if globalLoading.isLoading}
			<progress aria-labelledby="loader-label"></progress>
			<span>{m.elapsedSeconds({ seconds: globalLoading.elapsedSeconds })}</span>
		{/if}
	</div>
</div>

<style>
	.done {
		display: block;
		width: 0;
		height: 0;
		overflow: hidden;
	}
</style>
